module.exports = function (app, db_connection) {
    // import modules and utils
    const utils = require('../../utils/proceedData.js')(db_connection);
    const bcrypt = require('bcrypt');
    const CONFIG = require('../../config.json');
    const inputValidator = require('../../utils/validateInput.js')();

    // handle post request to /login
    app.post('/api/post/login', async (request, response) => {
        // get username and password from request body
        const email = inputValidator.isEmailValid(request.body.user_email);
        const password = inputValidator.isPasswordValid(request.body.user_password);

        if (!email.status || !password.status) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
        }

        const result = await utils.fetchByEmail(email.value).catch((error) => {
            console.log(error);
        });

        // check promise result and return error message if username is not in database
        if (!result || result.length === 0) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
        }

        // compare password hash with password
        const isPasswordCorrect = await bcrypt.compare(password.value, result[0][CONFIG.database.users_table_columns.user_password_hash])
            .catch((error) => {
                console.log(error);
            });

        // if password is correct, return user data
        if (isPasswordCorrect) {
            // store data in session
            const requestObject = {
                user_id: result[0][CONFIG.database.users_table_columns.user_id],
                user_name: result[0][CONFIG.database.users_table_columns.user_name],
                user_tag: result[0][CONFIG.database.users_table_columns.user_tag],
                user_email: result[0][CONFIG.database.users_table_columns.user_email],
                user_avatar_url: result[0][CONFIG.database.users_table_columns.user_avatar_url],
                user_permissions: result[0][CONFIG.database.users_table_columns.user_permissions],
                user_banner_color: result[0][CONFIG.database.users_table_columns.user_banner_color],
            };

            // store data in session
            await utils.storeDataInSession(request,
                requestObject['user_id'], requestObject['user_name'],
                requestObject['user_tag'], requestObject['user_email'],
                requestObject['user_permissions'], requestObject['user_avatar_url'],
                requestObject['user_banner_color']);

            // return user data
            return response.send({ status: 1, message: CONFIG.messages.LOGIN_SUCCESSFUL, user: requestObject });
        } else {
            // if password is incorrect, return error message
            return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
        }

    });


};