module.exports = function (app, db_connection) {
    // import modules and utils
    const createSnowflakeId = require('../../utils/generateID.js').createSnowflakeId;
    const createNewUserTag = require('../../utils/generateTag.js').createNewUserTag;
    const utils = require('../../utils/proceedData.js')(db_connection);
    const CONFIG = require('../../config.json');


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
            return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
        }

        // check if email is already in use
        utils.fetchByEmail(email).then(async (result) => {
            // check promise result and return error message if email is in use
            if (result.length > 0) {
                return response.send({ status: 0, message: CONFIG.messages.EMAIL_ALREADY_IN_USE });
            }

            let tries, user_id, user_tag;

            // if email is not in use
            // create user id and user tag
            for (tries = 0; tries < 10000; tries++) {
                user_id = await createSnowflakeId();
                user_tag = createNewUserTag();

                // check if user id and user tag are already in use
                const idOrUsernameExists = await utils.idOrUsernameExists(user_id, user_name, user_tag);

                // if yes, generate new user id and user tag and try again
                if (idOrUsernameExists.length > 0) {
                    continue;
                }

                // if no, break loop
                break;
            }

            // if user id and user tag are not in use, hash password
            if (tries < 10000) {
                const hash = await utils.hashPassword(password).then((hash) => hash).catch((err) => {
                    console.log(err)
                    // return error message if hashing failed
                    return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
                }); // end of hashPassword promise

                // insert user into database
                const insertNewUser = await utils.insertNewUser(user_id, user_name, user_tag, email, hash);

                // return success message if user was inserted into database
                if (insertNewUser) {
                    // create session for new user
                    await utils.storeDataInSession(request, user_id, user_name, user_tag, email, 0);

                    return response.send({ status: 1, message: CONFIG.messages.REGISTRATION_SUCCESSFUL });
                }

                // return error message if user was not inserted into database
                return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
            }

            // return error message if user id and user tag could not be generated

        }).catch((err) => {
            console.log(err)
            // return error message if email check failed
            return response.headersSent ? response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG }) : null;
        }); // end of emailExists promise
    }); // end of app.post


}