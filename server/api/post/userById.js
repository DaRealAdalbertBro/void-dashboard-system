const { snowflakeIdCreatedAt } = require('../../utils/generateID');

module.exports = function (app, db_connection) {
    const CONFIG = require('../../config.json');
    const utils = require('../../utils/proceedData')(db_connection);

    app.post("/api/post/userById", (request, response) => {
        // get user id from request
        let user_id = request.body.user_id;

        try {
            user_id = parseInt(user_id);
        } catch (error) {
            console.log(error)
        }

        // check if user is logged in
        if (!request.session.user) {
            // if user is not logged in, return false and NOT_LOGGED_IN message
            return response.send({ status: false, message: CONFIG.messages.NOT_LOGGED_IN });
        }

        // check if user_id exists, if not se the one from the session
        if (!user_id) {
            user_id = request.session.user.user_id;
        }

        // define if user can edit profile
        let canEditUser = false;

        // check if user is trying to edit himself
        if (user_id === request.session.user.user_id) {
            const userObject = {
                ...request.session.user,
                user_created_at: snowflakeIdCreatedAt(request.session.user.user_id)
            }

            return response.send({ status: true, user: userObject, canEditProfile: true });
        }

        const tableColumns = CONFIG.database.users_table_columns;

        // try to fetch user by id
        utils.fetchById(user_id, `${tableColumns.user_id}, ${tableColumns.user_name}, ${tableColumns.user_tag}, ${tableColumns.user_email}, ${tableColumns.user_avatar_url}, ${tableColumns.user_banner_color}, ${tableColumns.user_permissions}`)
            .then(result => {
                // if user is found, return true and user object
                if (result.length) {
                    // check if user has permissions to edit the user
                    // also check if user is trying to edit himself
                    // or if user is trying to edit another user that has lower permissions
                    if ((request.session.user.user_permissions >= CONFIG.permissions.administrator && request.session.user.user_permissions > result[0][tableColumns.user_permissions])) {
                        canEditUser = true;
                    }

                    const userObject = {
                        ...result[0],
                        user_created_at: snowflakeIdCreatedAt(result[0].user_id),
                    }

                    return response.send({ status: true, user: userObject, canEditProfile: canEditUser });
                }

                // if user is not found, return false and USER_NOT_FOUND message
                return response.send({ status: false, message: CONFIG.messages.USER_NOT_FOUND });

            })
            // if error occurs, return false and error message
            .catch(error => {
                console.log(error);
                return response.send({ status: false, message: CONFIG.messages.ERROR });
            }); // end of fetchById

    })

}