module.exports = function (app, db_connection) {
    // import modules and utils
    const createSnowflakeId = require('../../utils/generateID.js').createSnowflakeId;
    const createNewUserTag = require('../../utils/generateTag.js').createNewUserTag;
    const utils = require('../../utils/proceedData.js')(db_connection);
    const CONFIG = require('../../config.json');
    const inputValidator = require('../../utils/validateInput.js')();

    // handle post request to /register
    app.post('/api/post/register', async (request, response) => {
        // is user logged in
        if (!request.session.user) {
            return response.send({ status: 0, message: CONFIG.messages.NOT_LOGGED_IN });
        }

        // check if user is logged in or has permissions to register new users
        if (request.session.user.user_permissions < CONFIG.permissions.administrator) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_PERMISSIONS });
        }

        // get username, email and password from request body
        const user_name = inputValidator.isUsernameValid(request.body.username);
        const email = inputValidator.isEmailValid(request.body.email);
        const password = inputValidator.isPasswordValid(request.body.password);

        // check if username, email and password are valid
        if (!user_name.status || !email.status || !password.status) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
        }

        // check if email is already in use
        const result = await utils.fetchByEmail(email.value).catch(error => {
            console.log(error);
        });

        // check promise result and return error message if email is in use
        if (result && result.length > 0) {
            return response.send({ status: 0, message: CONFIG.messages.EMAIL_ALREADY_IN_USE });
        }

        let tries, user_id, user_tag;

        // create user id and user tag
        for (tries = 0; tries < 10000; tries++) {
            user_id = await createSnowflakeId();
            user_tag = createNewUserTag();

            // check if user id and user tag are already in use
            const idOrUsernameExists = await utils.idOrUsernameExists(user_id, user_name.value, user_tag).catch(error => {
                console.log(error);
            });

            // if yes, generate new user id and user tag and try again
            if (idOrUsernameExists && idOrUsernameExists.length > 0) {
                continue;
            }

            // if no, break loop
            break;
        }

        // return error message if user id and user tag could not be generated
        if (tries >= 10000) {
            return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
        }
        
        // if user id and user tag are not in use, hash password
        const hash = await utils.hashPassword(password.value).then((hash) => hash).catch((error) => {
            console.log(error);
        });

        // insert user into database
        const insertNewUser = await utils.insertNewUser(user_id, user_name.value, user_tag, email.value, hash);
        
        // return error message if user was not inserted into database
        if (!insertNewUser) {
            return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
        }
        
        // create session for new user
        await utils.storeDataInSession(request, user_id, user_name.value, user_tag, email.value, 0);
        
        // return success message if user was inserted into database
        return response.send({ status: 1, message: CONFIG.messages.REGISTRATION_SUCCESSFUL });

    }); // end of app.post


}