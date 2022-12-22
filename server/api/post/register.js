module.exports = function (app, db_connection) {
    // import modules and utils
    const createSnowflakeId = require('../../utils/generateID.js').createSnowflakeId;
    const createNewUserTag = require('../../utils/generateTag.js').createNewUserTag;
    const utils = require('../../utils/proceedData.js')(db_connection);
    const bcrypt = require('bcrypt');
    // salt rounds for bcrypt
    const saltRounds = 10;

    // handle post request to /register
    app.post('/api/post/register', (request, response) => {
        // get username, email and password from request body
        const user_name = request.body.username;
        const email = request.body.email;
        const password = request.body.password;

        // check if fields are valid
        if (!(user_name && email && password)
            || password.length < 8 || password.length > 255
            || user_name.length < 4 || user_name.length > 32
            || email.length < 4 || email.length > 255
            || Buffer.byteLength(user_name, "utf-8") > 64
            || !email.includes('@')
            || Buffer.byteLength(password, "utf-8") > 255
            || Buffer.byteLength(email, "utf-8") > 255) {
            // if not, return error message
            return response.send({ status: 0, message: 'Invalid username, email or password' });
        }

        // check if email is already in use
        utils.emailExists(email).then(async (result) => {
            // check promise result and return error message if email is in use
            if (result.length > 0) {
                return response.send({ status: 0, message: 'Email already in use' });
            }

            // if email is not in use
            // create user id and user tag
            for (let tries = 0; tries < 10000; tries++) {
                const user_id = await createSnowflakeId();
                const user_tag = createNewUserTag();

                // check if user id and user tag are already in use
                const idOrUsernameExists = await utils.idOrUsernameExists(user_id, user_name, user_tag);

                // if yes, generate new user id and user tag and try again
                if (idOrUsernameExists.length > 0) {
                    continue;
                }

                // if user id and user tag are not in use, hash password
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                    // return error message if hashing failed
                    if (err) {
                        return response.send({ status: 0, message: 'Something went wrong... Try again later!' });
                    }

                    // insert user into database
                    const insertNewUser = await utils.insertNewUser(user_id, user_name, user_tag, email, hash);

                    // return success message if user was inserted into database
                    if (insertNewUser) {
                        // create session for new user
                        await utils.storeDataInSession(request, user_id, user_name, user_tag, email, 0, "/assets/images/avatars/default.png");

                        return response.send({ status: 1, message: 'Registration successful' });
                    }

                    // return error message if user was not inserted into database
                    return response.send({ status: 0, message: 'Something went wrong... Try again later!' });
                }); // end of bcrypt.hash

                break;
            } // end of while loop


        }); // end of utils.emailExists

    });

}