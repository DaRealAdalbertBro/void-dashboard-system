const { snowflakeIdCreatedAt } = require('../../utils/generateID.js');

module.exports = function (app, db_connection, upload) {
    const utils = require('../../utils/proceedData.js')(db_connection);
    const CONFIG = require('../../config.json');

    // upload.single is used to upload a single file 
    app.post('/api/post/updateuser', upload.single('user_avatar_file'), function (request, response) {
        let user_id = request.body.user_id;
        const user_name = request.body.user_name;
        const user_tag = request.body.user_tag;
        const user_email = request.body.user_email;
        const user_old_password = request.body.user_old_password;
        const user_new_password = request.body.user_new_password;
        const user_repeat_new_password = request.body.user_repeat_new_password;
        let user_avatar_url = request.body.user_avatar_url;
        let user_permissions = request.body.user_permissions;
        const user_banner_color = request.body.user_banner_color;


        // check if user exists in request body
        if (!user_id) {
            return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
        }

        try {
            user_id = parseInt(user_id);
        } catch (error) {
            return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
        }

        // check if user has permissions to update the data
        if (request.session.user.user_permissions < CONFIG.permissions.administrator && user_id !== request.session.user.user_id) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_PERMISSIONS })
        }

        if (request.file) {
            const url = request.protocol + '://' + request.get('host')
            const profileImg = url + '/public/uploads/' + request.file.filename
            if (!user_avatar_url) {
                user_avatar_url = profileImg;
            }
        }

        let updateObject = {};


        // check if fields are valid
        if (!user_name && !user_tag && !user_email && (!user_old_password && !user_new_password && !user_repeat_new_password) && !user_avatar_url && !user_permissions && !user_banner_color) {
            return response.send({ status: 0, message: CONFIG.messages.NOTHING_TO_UPDATE });
        }

        // check if user exists in database
        utils.fetchById(user_id).then(async (result) => {
            // check promise result and return error message if user is not in database
            if (!result) {
                return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
            }

            // check if username is already in use
            // check if username is not the same as the current one
            if (user_name && user_tag
                && (user_name !== result[0][CONFIG.database.users_table_columns.user_name] || user_tag !== result[0][CONFIG.database.users_table_columns.user_tag])) {
                const nameExists = await utils.fetchByName(user_name, user_tag).catch((error) => {
                    console.log(error);
                });

                // return error message if username is already in use
                if (nameExists.length > 0) {
                    return response.send({ status: 0, message: CONFIG.messages.USER_ALREADY_EXISTS });
                }

                updateObject.user_name = user_name;
                updateObject.user_tag = user_tag;
            }

            // check if email is already in use
            // check if email is not the same as the current one
            if (user_email && user_email !== result[0][CONFIG.database.users_table_columns.user_email]) {
                const emailExists = await utils.fetchByEmail(user_email).catch((error) => {
                    console.log(error);
                });

                if (emailExists.length > 0) {
                    return response.send({ status: 0, message: CONFIG.messages.EMAIL_ALREADY_IN_USE });
                }

                updateObject.user_email = user_email;
            }

            // check if old password is correct
            if (user_old_password && user_new_password && user_repeat_new_password) {
                // compare password hashes
                const passwordMatch = await utils.comparePasswords(user_old_password, result[0][CONFIG.database.users_table_columns.user_password_hash]).catch((error) => {
                    console.log(error);
                });

                // return error message if password is incorrect
                if (!passwordMatch) {
                    return response.send({ status: 0, message: CONFIG.messages.INVALID_OLD_PASSWORD });
                }

                // check if new password match
                if (user_new_password !== user_repeat_new_password) {
                    return response.send({ status: 0, message: CONFIG.messages.PASSWORDS_DONT_MATCH });
                }

                // hash new password
                const hashedNewPassword = await utils.hashPassword(user_new_password).catch((error) => {
                    console.log(error);
                });

                // return error message if password was not hashed
                if (!hashedNewPassword) {
                    return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
                }

                // update password hash in update object
                updateObject.user_password_hash = hashedNewPassword;
            }

            // check if avatar url is valid
            // check if avatar url is not the same as the current one
            if (user_avatar_url && user_avatar_url !== CONFIG.defaults.DEFAULT_AVATAR_URL
                && user_avatar_url !== result[0][CONFIG.database.users_table_columns.user_avatar_url]) {
                updateObject.user_avatar_url = user_avatar_url;
            }

            // check if banner color is valid
            // check if banner color is not the same as the current one
            if (user_banner_color && user_banner_color !== CONFIG.defaults.DEFAULT_BANNER_COLOR) {
                updateObject.user_banner_color = user_banner_color;
            }

            // check if permissions are valid
            // check if permissions are not the same as the current ones
            if (user_permissions && user_permissions !== result[0][CONFIG.database.users_table_columns.user_permissions]) {
                try {
                    user_permissions = parseInt(user_permissions);
                }
                catch (error) {
                    console.log(error);
                }

                updateObject.user_permissions = user_permissions;
            }

            // update user data
            const update = await utils.updateUser(user_id, updateObject).catch((error) => {
                console.log(error);
            });;

            // return success message if user data was updated
            if (update && update.affectedRows > 0) {
                // construct user object to return
                const userObject = {
                    user_id: user_id || result[0][CONFIG.database.users_table_columns.user_id],
                    user_name: user_name || result[0][CONFIG.database.users_table_columns.user_name],
                    user_tag: user_tag || result[0][CONFIG.database.users_table_columns.user_tag],
                    user_email: user_email || result[0][CONFIG.database.users_table_columns.user_email],
                    user_avatar_url: user_avatar_url || result[0][CONFIG.database.users_table_columns.user_avatar_url],
                    user_permissions: user_permissions || result[0][CONFIG.database.users_table_columns.user_permissions],
                    user_banner_color: user_banner_color || result[0][CONFIG.database.users_table_columns.user_banner_color],
                    user_created_at: snowflakeIdCreatedAt(user_id || result[0][CONFIG.database.users_table_columns.user_id]),
                }

                // store new user data in session if user is updating their own data
                if (user_id === request.session.user.user_id) {
                    await utils.storeDataInSession(request,
                        userObject['user_id'], userObject['user_name'], userObject['user_tag'],
                        userObject['user_email'], userObject['user_permissions'],
                        userObject['user_avatar_url'], userObject['user_banner_color']);
                }

                // return success message
                return response.send({ status: 1, message: CONFIG.messages.USER_UPDATED, user: userObject });
            }

            // return error message if user data was not updated
            return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
        }).catch((error) => {
            console.log(error);
        });
    });
}