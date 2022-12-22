// import generateID
const { createSnowflakeId, snoflakeIdCreatedAt } = require('./utils/generateID');

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { createNewUserTag } = require('./utils/generateTag');

const app = express();

app.use(express.json());

app.use(cors({
    origin: ["http://localhost:3000", "https://cdn.artificialvoid.com/dashboard/default_profile_picture.jpg", "*", "https://artificialvoid.com/"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// create session that expires in 24 hours
app.use(session({
    key: "userId",
    secret: "A9bCV%Z+H'o`0,N(-q7,&{F_E<jIpHyEy>9bp^z?{T7'h|k+p{{BhAr[f<&b+35s^7B5E^/>hpbdGWa@Txi%n=ctxYwdc?=\")lcwY2ZQ'p}dzFtQ6]p'n*XrH(J`8|",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
    },
})
);

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'AveX0949logis',
    database: 'loginSystem',
});

app.get('/api/userinfo', (request, response) => {
    if (request.session.user) {

        const userObject = {
            user_name: request.session.user.user_name,
            user_tag: request.session.user.user_tag,
            user_email: request.session.user.user_email,
            user_id: request.session.user.user_id,
            user_permissions: request.session.user.user_permissions,
            user_profile_picture: request.session.user.user_profile_picture,
            user_created_at: snoflakeIdCreatedAt(request.session.user.user_id)
        }


        response.send({
            loggedIn: true,
            user: userObject
        });
    }
    else {
        response.send({ loggedIn: false });
    }
});

app.post('/logout', (request, response) => {
    request.session.destroy();
    response.send({ message: 'Logged out' });
});


app.post('/login', (request, response) => {
    // store username and password in variables
    const username = request.body.username;
    const password = request.body.password;

    // set default username query to user_name, if email is entered, change to user_email
    let usernameQuery = "user_name";
    if (username.includes('@')) {
        usernameQuery = "user_email";
    }

    // check if username and password are valid
    if (username.length < 4 || username.length > 32 || Buffer.byteLength(username, "utf-8") > 64
        || password.length < 8 || password.length > 255 || Buffer.byteLength(password, "utf-8") > 255) {
        return response.send({ message: 'Invalid credentials' });
    }

    // check if username exists in database
    db.query(
        `SELECT * FROM users WHERE ${usernameQuery} = ?`,
        [username],
        (error, result) => {
            // if error, return error message
            if (error) {
                return response.send({ message: 'Something went wrong... Try again later!' });
            }

            // if username exists, compare password to password hash
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    bcrypt.compare(password, result[i].user_password_hash, (err, res) => {
                        // if any response, store user in session and return success message 
                        if (res) {
                            request.session.user = {
                                user_name: result[i].user_name,
                                user_tag: result[i].user_tag,
                                user_email: result[i].user_email,
                                user_id: result[i].user_id,
                                user_permissions: result[i].user_permissions,
                                user_profile_picture: result[i].user_profile_picture,
                            };

                            return response.send({ message: 'Logged in successfully' });
                        }

                        // if no response, return error message
                        if (i === result.length - 1) {
                            return response.send({ message: 'Incorrect username or password' });
                        }
                    });
                }

            } else {
                response.send({ message: 'Incorrect username or password' });
            }
        }
    );
});

app.post('/register', (request, response) => {
    const username = request.body.username;
    const email = request.body.email;
    const password = request.body.password;

    let errors = [];

    if (!(username && email && password)) {
        errors.push({ message: 'All fields are required' });
    }

    if (password.length < 8) {
        errors.push({ message: 'Password is too short' });
    }

    if (password.length > 255) {
        errors.push({ message: 'Password is too long' });
    }

    if (username.length < 4) {
        errors.push({ message: 'Username is too short' });
    }

    if (username.length > 255) {
        errors.push({ message: 'Username is too long' });
    }

    if (email.length < 4) {
        errors.push({ message: 'Email is too short' });
    }

    if (email.length > 255) {
        errors.push({ message: 'Email is too long' });
    }

    const usernameBytes = Buffer.byteLength(username, "utf-8");
    if (usernameBytes > 64) {
        errors.push({ message: 'Username is too long' });
    }

    // verify email is valid
    if (!email.includes('@')) {
        errors.push({ message: 'Email is invalid' });
    }

    if (errors.length > 0) {
        return response.send(errors);
    }

    const userID = createSnowflakeId();
    const userTag = createNewUserTag();

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return response.send({ message: 'Something went wrong... Try again later!' });
        }

        db.query(
            "SELECT user_name FROM users WHERE user_id = ? OR user_email = ? OR (user_name = ? AND user_tag = ?)",
            [userID, email, username, userTag],
            (error, result) => {
                if (error) {
                    return response.send({ message: 'Something went wrong... Try again later!' });
                }

                if (result.length > 0) {
                    return response.send({ message: 'Username or email already in use' });
                }

                db.query(
                    "INSERT INTO users (user_name, user_email, user_password_hash, user_id, user_tag) VALUES (?, ?, ?, ?, ?)",
                    [username, email, hash, userID, userTag],

                    (error, result) => {
                        if (error) {
                            return response.send({ message: 'Something went wrong... Try again later!' });
                        } else {
                            request.session.user = {
                                user_name: result[0].user_name,
                                user_tag: result[0].user_tag,
                                user_email: result[0].user_email,
                                user_id: result[0].user_id,
                                user_permissions: result[0].user_permissions,
                                user_profile_picture: result[0].user_profile_picture,
                            };

                            return response.send({ message: 'User has been registered' });
                        }
                    }
                );

            }
        )

    });



})

app.listen(3001, () => {
    console.log('running server');
});

