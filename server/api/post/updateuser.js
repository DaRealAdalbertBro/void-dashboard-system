module.exports = function (app, db_connection) {
    const utils = require('../../utils/proceedData.js')(db_connection);

    app.post('/api/post/updateuser', function (request, response) {
        const user_id = request.body.user_id;
        const user_name = request.body.user_name;
        const user_tag = request.body.user_tag;
        const user_email = request.body.user_email;
        const user_old_password = request.body.user_old_password;
        const user_new_password = request.body.user_new_password;
        const user_repeat_new_password = request.body.user_repeat_new_password;
        const user_avatar_url = request.body.user_avatar_url;
        const user_permissions = request.body.user_permissions;

        let updateObject = {};

        // check if user exists in request body
        if (!user_id) {
            return response.send({ status: 0, message: 'User not found' });
        }

        // check if fields are valid
        if (!user_name && !user_tag && !user_email && (!user_old_password && !user_new_password && !user_repeat_new_password)) {
            return response.send({ status: 0, message: 'Nothing to update' });
        }

        // check if user exists in database
        utils.fetchById(user_id).then(async (result) => {
            // check promise result and return error message if user is not in database
            if (!result) {
                return response.send({ status: 0, message: 'User not found' });
            }

            // check if username is already in use
            // check if username is not the same as the current one
            if (user_name && user_tag
                && (user_name !== result[0].user_name || user_tag !== result[0].user_tag)) {
                const nameExists = await utils.fetchByName(user_name, user_tag).catch((error) => {
                    console.log(error);
                });

                // return error message if username is already in use
                if (nameExists.length > 0) {
                    return response.send({ status: 0, message: 'Username with this tag is already in use' });
                }

                updateObject.user_name = user_name;
                updateObject.user_tag = user_tag;
            }

            // check if email is already in use
            // check if email is not the same as the current one
            if (user_email && user_email !== result[0].user_email) {
                const emailExists = await utils.fetchByEmail(user_email).catch((error) => {
                    console.log(error);
                });

                if (emailExists.length > 0) {
                    return response.send({ status: 0, message: 'Email already in use' });
                }

                updateObject.user_email = user_email;
            }

            // check if old password is correct
            if (user_old_password && user_new_password && user_repeat_new_password) {

                if (result[0].length > 0) {
                    // compare password hashes
                    const passwordHash = result[0].user_password_hash;
                    const userOldHash = bcrypt.hashSync(user_old_password, passwordHash);

                    // return error message if password is incorrect
                    if (userOldHash) {
                        return response.send({ status: 0, message: 'Old password is incorrect' });
                    }

                    // return error message if new passwords do not match
                    if (user_new_password !== user_repeat_new_password) {
                        return response.send({ status: 0, message: 'New passwords do not match' });
                    }

                    // hash the new password
                    await utils.convertPasswordToHash(user_new_password).then((hash) => {
                        updateObject.user_password_hash = hash;
                    }).catch((error) => {
                        console.log(error);
                    });
                }
            }

            // check if avatar url is valid
            // check if avatar url is not the same as the current one
            if (user_avatar_url && user_avatar_url !== "/assets/images/avatars/default.webp"
                && !user_avatar_url === result[0].user_avatar_url) {
                updateObject.user_avatar_url = user_avatar_url;
            }

            // check if permissions are valid
            // check if permissions are not the same as the current ones
            if (user_permissions && user_permissions !== result[0].user_permissions) {
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
                    user_id: user_id || result[0].user_id,
                    user_name: user_name || result[0].user_name,
                    user_tag: user_tag || result[0].user_tag,
                    user_email: user_email || result[0].user_email,
                    user_avatar_url: user_avatar_url || result[0].user_avatar_url,
                    user_permissions: user_permissions || result[0].user_permissions
                }

                // store new user data in session
                await utils.storeDataInSession(request, userObject['user_id'], userObject['user_name'], userObject['user_tag'], userObject['user_email'], userObject['user_permissions'], userObject['user_avatar_url']);

                // return success message
                return response.send({ status: 1, message: 'Updated', user: userObject });
            }

            // return error message if user data was not updated
            return response.send({ status: 0, message: 'Something went wrong... Try again later!' });
        }).catch((error) => {
            console.log(error);
        });
    });
}