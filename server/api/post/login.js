module.exports = function (app, db_connection) {
    // import modules and utils
    const utils = require('../../utils/proceedData.js')(db_connection);
    const bcrypt = require('bcrypt');
    const CONFIG = require('../../config.json');

    // handle post request to /login
    app.post('/api/post/login', (request, response) => {
        // get username and password from request body
        const email = request.body.username;
        const password = request.body.password;



        // check if fields are valid
        if ((email.length < 4 || email.length > 255 || Buffer.byteLength(email, "utf-8") > 255)
            || password.length < 8 || password.length > 255 || Buffer.byteLength(password, "utf-8") > 255) {
            // if not, return error message
            return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
        }


        utils.fetchByEmail(email).then(async (result) => {
            // check promise result and return error message if username is not in database
            if (!result || result.length === 0) {
                return response.send({ status: 0, message: CONFIG.messages.INVALID_CREDENTIALS });
            }

            // compare password hash with password
            const isPasswordCorrect = await bcrypt.compare(password, result[0][CONFIG.database.users_table_columns.user_password_hash])
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

        }).catch((error) => {
            console.log(error);
        });
    });

};