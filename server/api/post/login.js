module.exports = function (app, db_connection) {
    // import modules and utils
    const utils = require('../../utils/proceedData.js')(db_connection);
    const bcrypt = require('bcrypt');
    const CONFIG = require('../../config.json');

    // handle post request to /login
    app.post('/api/post/login', (request, response) => {
        // get username and password from request body
        const username = request.body.username;
        const password = request.body.password;

        // check if username is email
        let isUsernameEmail = username.includes('@') ? true : false;

        // check if fields are valid
        if (!isUsernameEmail && (username.length < 4 || username.length > 32 || Buffer.byteLength(username, "utf-8") > 64)
            || isUsernameEmail && (username.length < 4 || username.length > 255 || Buffer.byteLength(username, "utf-8") > 255)
            || password.length < 8 || password.length > 255 || Buffer.byteLength(password, "utf-8") > 255) {
            // if not, return error message
            return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
        }

        // check if username exists in database
        utils.emailOrUsernameExists(username, isUsernameEmail, "*").then(async (result) => {
            // check promise result and return error message if username is not in database
            if (!result) {
                return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
            }

            // go through all users with same username and check if password is correct
            for (const element of result) {
                // compare password with hashed password
                const isPasswordCorrect = await bcrypt.compare(password, element[CONFIG.database.users_table_columns.user_password_hash]);

                // if password is correct, return user data
                if (isPasswordCorrect) {
                    // store data in session
                    await utils.storeDataInSession(request,
                        element[CONFIG.database.users_table_columns.user_id], element[CONFIG.database.users_table_columns.user_name],
                        element[CONFIG.database.users_table_columns.user_tag], element[CONFIG.database.users_table_columns.user_email],
                        element[CONFIG.database.users_table_columns.user_permissions], element[CONFIG.database.users_table_columns.user_avatar_url],
                        element[CONFIG.database.users_table_columns.user_banner_color]);

                    return response.send({ status: 1, message: CONFIG.messages.LOGIN_SUCCESSFUL });
                }
            }

            // if password is not correct, return error message
            return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
        }); // end of utils.emailOrUsernameExists

    }); // end of app.post
}
