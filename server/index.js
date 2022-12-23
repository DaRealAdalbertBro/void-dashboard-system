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

app.use(express.json());

console.log("-----------------------------------")
console.log("Setting up cors...")

// set cors options
app.use(cors({
    origin: ["http://localhost:3000", "*"],
    methods: ["GET", "POST"],
    credentials: true
}));

console.log("Setting up cookies...")
// use body-parser and cookie-parser for session
app.use(cookieParser());
// set body-parser limit to 8mb
app.use(bodyParser.json({ limit: "8mb" }));
app.use(bodyParser.urlencoded({ limit: "8mb", extended: true, parameterLimit: 1000000 }));

console.log("Setting up session...")
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

console.log("Connecting to database...")
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
        console.log("An error occurred while connecting to the database:")
        console.log(error);
    }
});


// POST
require("./api/post/register")(app, db_connection);
require("./api/post/login")(app, db_connection);
require("./api/post/logout")(app);
require("./api/post/updateuser")(app, db_connection);

// GET
require("./api/get/userinfo")(app);


// create server on port 3001 or port specified in .env file
app.listen(process.env.SERVER_PORT || 3001, () => {
    console.log('SERVER HAS STARTED');
    console.log("-----------------------------------")
});


