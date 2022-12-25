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

app.use(express.json());

console.log("-----------------------------------");
console.log("Setting up cors...");

// set cors options
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));

console.log("Setting up cookies...");
// use body-parser and cookie-parser for session
app.use(cookieParser());
// set body-parser limit to 8mb
app.use(bodyParser.json({ limit: "8mb" }));
app.use(bodyParser.urlencoded({ limit: "8mb", extended: true, parameterLimit: 1000000 }));

// express static means that the files in the folder are accessible from the browser
app.use('/public', express.static('public'));

console.log("Setting up session...");
// create session that expires in 24 hours
app.use(session({
    key: "userId",
    secret: "A9bCV%Z+H'o`0,N(-q7,&{F_E<jIpHyEy>9bp^z?{T7'h|k+p{{BhAr[f<&b+35s^7B5E^/>hpbdGWa@Txi%n=ctxYwdc?=\")lcwY2ZQ'p}dzFtQ6]p'n*XrH(J`8|",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
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
    limits: { fileSize: 8000000 },
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

// GET
require("./api/get/userinfo")(app);


// create server on port 3001 or port specified in .env file
app.listen(process.env.SERVER_PORT || 3001, () => {
    console.log('SERVER HAS STARTED');
    console.log("-----------------------------------")
});


app.use((req, res, next) => {
    setImmediate(() => {
        
        // respond with This site can’t be reached error ERR_INVALID_RESPONSE and send it to client
        const error = new Error();
        error.statusCode = 410;
        next(error);
    });
});


app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});