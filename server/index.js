// import generateID
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// import dotenv
require('dotenv').config();

// import body-parser and cookie-parser for session
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// create express app
const app = express();
const CDN_DIR = 'public/uploads/';

const CONFIG = require('./config.json');

app.use(express.json());

console.log("-----------------------------------");
console.log("Setting up cors...");

// set cors options
app.use(cors({
    // Set cors origin to the origin in config.json
    // ! WARNING - if the URL is not correct, the app will not work
    origin: CONFIG.defaults.DEFAULT_CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
}));

console.log("Setting up cookies...");
// use body-parser and cookie-parser for session
app.use(cookieParser());
// set body-parser limit to 8mb
app.use(bodyParser.json({ limit: CONFIG.defaults.DEFAULT_MAX_FILE_SIZE[0] }));
app.use(bodyParser.urlencoded({
    limit: CONFIG.defaults.DEFAULT_MAX_FILE_SIZE[0],
    extended: true,
    parameterLimit: 1000000
}));

// express static means that the files in the folder are accessible from the browser
app.use('/public', express.static('public'));

console.log("Setting up session...");

// set proxy
app.set('trust proxy', CONFIG.session.proxy);

// create session that expires based on the expiration time in config.json
app.use(session({
    key: CONFIG.session.session_key,
    secret: process.env.SESSION_SECRETS.split(" "),
    resave: false,
    saveUninitialized: false,
    proxy: CONFIG.session.proxy,
    rolling: CONFIG.session.rolling,
    cookie: {
        maxAge: CONFIG.session.cookies.expires,
        secure: CONFIG.session.cookies.secure,  // set to true if your using https
        sameSite: CONFIG.session.cookies.sameSite
    },
}));

console.log("Connecting to database...");
// create connection to database
const db_connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

// check if connection to database is successful
db_connection.connect((error) => {
    if (error) {
        console.log("An error occurred while connecting to the database:");
        console.log(error);
    }
});

// set up multer
const uuid = require('uuid').v4;
const multer = require('multer');

// set up storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CDN_DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuid() + '-' + fileName)
    }
});

// set up upload
const upload = multer({
    storage: storage,
    limits: { fileSize: CONFIG.defaults.DEFAULT_MAX_FILE_SIZE[1] },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('image') || file.mimetype.includes('gif')) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only image and gif formats are allowed!'));
        }
    }
});

// POST
require("./api/post/register")(app, db_connection);
require("./api/post/login")(app, db_connection);
require("./api/post/logout")(app);
require("./api/post/updateuser")(app, db_connection, upload);
require("./api/post/userById")(app, db_connection);
require("./api/post/fetchUserList")(app, db_connection);

// GET
require("./api/get/userinfo")(app);


// create server on port 3001 or port specified in .env file
app.listen(process.env.SERVER_PORT || 3001, () => {
    console.log('SERVER HAS STARTED');
    console.log("-----------------------------------")
});


app.use((req, res, next) => {
    // setImmediate is used to prevent the error from being sent to the client before the response is sent to the client
    setImmediate(() => {
        // respond with This site can’t be reached error ERR_INVALID_RESPONSE and send it to client
        const error = new Error();

        // if the url contains '/public/' then it is a 410 error
        if (req.originalUrl.includes('/public/')) {
            error.message = 'This file has been deleted or does not exist.';
            error.statusCode = 410;
        }
        else {
            // if the url does not contain '/public/' then it is a 404 error
            error.message = 'This page does not exist.';
            error.statusCode = 404;
        }
        next(error);
    });
});

app.use(function (err, req, res, next) {
    if (!err.statusCode) err.statusCode = 500;

    console.log(err.message);

    if (err) {
        return res.status(err.statusCode).send({ ok: false });
    }
    else {
        return res.status(200).send({ ok: true });
    }
});