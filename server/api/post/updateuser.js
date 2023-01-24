const { snowflakeIdCreatedAt } = require('../../utils/generateID.js');
const fs = require('fs')
const path = require('path')

// import .env
require('dotenv').config({
    path: path.resolve(__dirname, './.env')
});

module.exports = function (app, db_connection, upload) {
    const utils = require('../../utils/proceedData.js')(db_connection);
    const CONFIG = require('../../config.json');
    const inputValidator = require('../../utils/validateInput.js')();

    // upload.single is used to upload a single file 
    app.post('/api/post/updateuser', upload.single('user_avatar_file'), async (request, response) => {
        // check if user is logged in
        if (!request.session.user) {
            return response.send({ status: false, message: CONFIG.messages.NOT_LOGGED_IN });
        }

        // get user data from request body and validate it
        const user_id = inputValidator.isUserIdValid(request.body.user_id);
        const user_name = inputValidator.isUsernameValid(request.body.user_name);
        const user_tag = inputValidator.isTagValid(request.body.user_tag);
        const user_email = inputValidator.isEmailValid(request.body.user_email);
        const user_old_password = inputValidator.isPasswordValid(request.body.user_old_password);
        const user_new_password = inputValidator.isPasswordValid(request.body.user_new_password);
        const user_repeat_new_password = inputValidator.isPasswordValid(request.body.user_repeat_new_password);
        let user_avatar_url = inputValidator.isAvatarUrlValid(request.body.user_avatar_url);
        const user_permissions = inputValidator.isPermissionLevelValid(request.body.user_permissions);
        const user_banner_color = inputValidator.isBannerColorValid(request.body.user_banner_color);

        // check if user exists in request body
        if (!user_id.status) {
            return { status: false, message: CONFIG.messages.USER_NOT_FOUND };
        }

        // check if user has permissions to update the data
        if (request.session.user.user_permissions < CONFIG.permissions.administrator
            && user_id.value !== request.session.user.user_id) {
            return response.send({ status: false, message: CONFIG.messages.INVALID_PERMISSIONS })
        }

        if (request.file) {
            const domainUrl = request.protocol + '://' + request.get('host');
            const profileImg = domainUrl + '/cdn/uploads/' + request.file.filename;
            if (!user_avatar_url.status) {
                user_avatar_url = inputValidator.isAvatarUrlValid(profileImg);
            }
        }

        let updateObject = {};

        // check if fields are valid
        if (!user_name.status
            && !user_tag.status
            && !user_email.status
            && (!user_new_password.status && !user_repeat_new_password.status)
            && !user_avatar_url.status
            && !user_permissions.status
            && !user_banner_color.status) {
            return response.send({ status: false, message: CONFIG.messages.NOTHING_TO_UPDATE });
        }

        // check if user exists in database
        const result = await utils.fetchById(user_id.value).catch((error) => {
            console.log(error);
        });

        // check promise result and return error message if user is not in database
        if (!result || result.length === 0) {
            return response.send({ status: false, message: CONFIG.messages.USER_NOT_FOUND });
        }

        // bool that checks if user can edit the requested user
        let isAdmin = false;

        // check if user has permissions to edit the user
        // also check if user is trying to edit himself
        // or if user is trying to edit another user that has lower permissions
        if ((request.session.user.user_permissions >= CONFIG.permissions.administrator
            && request.session.user.user_permissions > result[0][CONFIG.database.users_table_columns.user_permissions])
            && request.session.user.user_id !== result[0][CONFIG.database.users_table_columns.user_id]) {
            isAdmin = true;
        }

        // check if username is already in use
        // check if username is not the same as the current one
        if (user_name.status && user_tag.status
            && (user_name.value !== result[0][CONFIG.database.users_table_columns.user_name] || user_tag.value !== result[0][CONFIG.database.users_table_columns.user_tag])) {
            const nameExists = await utils.fetchByName(user_name.value, user_tag.value).catch((error) => {
                console.log(error);
            });

            // return error message if username is already in use
            if (nameExists.length > 0) {
                return response.send({ status: 0, message: CONFIG.messages.USER_ALREADY_EXISTS });
            }

            updateObject.user_name = user_name.value;
            updateObject.user_tag = user_tag.value;
        }

        // check if email is already in use
        // check if email is not the same as the current one
        if (user_email.status && user_email.value !== result[0][CONFIG.database.users_table_columns.user_email]) {
            const emailExists = await utils.fetchByEmail(user_email.value).catch((error) => {
                console.log(error);
            });

            if (emailExists.length > 0) {
                return response.send({ status: 0, message: CONFIG.messages.EMAIL_ALREADY_IN_USE });
            }

            updateObject.user_email = user_email.value;
        }

        // check passwords
        if (user_new_password.status && user_repeat_new_password.status) {

            // check if old password is valid if user is not admin
            if (!isAdmin && !user_old_password.value) {
                return response.send({ status: 0, message: CONFIG.messages.INVALID_OLD_PASSWORD });
            }

            if (!isAdmin) {
                const passwordMatch = await utils.comparePasswords(user_old_password.value, result[0][CONFIG.database.users_table_columns.user_password_hash]).catch((error) => {
                    console.log(error);
                });

                // return error message if old password is not correct
                if (!passwordMatch) {
                    return response.send({ status: 0, message: CONFIG.messages.INVALID_OLD_PASSWORD });
                }
            }

            // check if new password match
            if (user_new_password.value !== user_repeat_new_password.value) {
                return response.send({ status: 0, message: CONFIG.messages.PASSWORDS_DONT_MATCH });
            }

            // hash new password
            const hashedNewPassword = await utils.hashPassword(user_new_password.value).catch((error) => {
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
        // and is not the same as the current one
        if (user_avatar_url.status) {
            updateObject.user_avatar_url = user_avatar_url.value;
        }

        // check if banner color is valid
        // check if banner color is not the same as the current one
        if (user_banner_color.status) {
            updateObject.user_banner_color = user_banner_color.value;
        }

        // check if permissions are valid
        // check if permissions are not the same as the current ones
        // check if the user has permissions to change permissions of other users or yourself
        if (user_permissions.status
            && request.session.user.user_id != user_id.value
            && user_permissions.value !== result[0][CONFIG.database.users_table_columns.user_permissions]
            && request.session.user.user_permissions >= CONFIG.permissions.administrator
            && request.session.user.user_permissions > user_permissions.value){

            updateObject.user_permissions = user_permissions.value;
        }

        // update user data
        const update = await utils.updateUser(user_id.value, updateObject).catch((error) => {
            console.log(error);
        });;

        // return success message if user data was updated
        if (update && update.affectedRows > 0) {
            // construct user object to return
            const userObject = {
                user_id: user_id.value || result[0][CONFIG.database.users_table_columns.user_id],
                user_name: user_name.value || result[0][CONFIG.database.users_table_columns.user_name],
                user_tag: user_tag.value || result[0][CONFIG.database.users_table_columns.user_tag],
                user_email: user_email.value || result[0][CONFIG.database.users_table_columns.user_email],
                user_avatar_url: user_avatar_url.value || result[0][CONFIG.database.users_table_columns.user_avatar_url],
                user_permissions: user_permissions.value || result[0][CONFIG.database.users_table_columns.user_permissions],
                user_banner_color: user_banner_color.value || result[0][CONFIG.database.users_table_columns.user_banner_color],
                user_created_at: snowflakeIdCreatedAt(user_id.value || result[0][CONFIG.database.users_table_columns.user_id]),
            }

            // store new user data in session if user is updating their own data
            if (user_id.value === request.session.user.user_id) {
                await utils.storeDataInSession(request,
                    userObject['user_id'], userObject['user_name'], userObject['user_tag'],
                    userObject['user_email'], userObject['user_permissions'],
                    userObject['user_avatar_url'], userObject['user_banner_color']);
            }

            // return success message
            return response.send({ status: 1, message: CONFIG.messages.USER_UPDATED, user: userObject });
        }

        // if there's an avatar url
        if(user_avatar_url.status
            && user_avatar_url.value === CONFIG.defaults.DEFAULT_CLIENT_AVATAR_URL
            && user_avatar_url.value !== result[0][CONFIG.database.users_table_columns.user_avatar_url]){
                const domainUrl = request.protocol + '://' + request.get('host') + ":" + process.env.SERVER_PORT;
            fs.unlink(path.join(__dirname, '..', '..', result[0][CONFIG.database.users_table_columns.user_avatar_url].replace(domainUrl,"")), (err) => {
                if(err && err.code !== 'ENOENT'){
                    console.log(err)
                }
            })
        }

    });
}