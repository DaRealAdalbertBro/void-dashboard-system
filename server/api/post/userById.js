const { snowflakeIdCreatedAt } = require('../../utils/generateID');

module.exports = function (app, db_connection) {
    const CONFIG = require('../../config.json');
    const utils = require('../../utils/proceedData')(db_connection);
    const inputValidator = require('../../utils/validateInput.js')();

    app.post("/api/post/userById", async (request, response) => {
        // get user id from request
        let user_id = inputValidator.isUserIdValid(request.body.user_id);

        // check if user is logged in
        if (!request.session.user) {
            return response.send({ status: false, message: CONFIG.messages.NOT_LOGGED_IN });
        }

        // check if user_id exists, if not se the one from the session
        if (!user_id.status) {
            user_id = inputValidator.isUserIdValid(request.session.user.user_id);
        }

        // define if user can edit profile
        let canEditUser = false;

        // check if user is trying to edit himself
        if (user_id.value === request.session.user.user_id) {
            const userObject = {
                ...request.session.user,
                user_created_at: snowflakeIdCreatedAt(request.session.user.user_id)
            }

            return response.send({ status: true, user: userObject, canEditProfile: true });
        }

        const tableColumns = CONFIG.database.users_table_columns;

        // try to fetch user by id
        const result = await utils.fetchById(user_id.value, `${tableColumns.user_id}, ${tableColumns.user_name}, ${tableColumns.user_tag}, ${tableColumns.user_email}, ${tableColumns.user_avatar_url}, ${tableColumns.user_banner_color}, ${tableColumns.user_permissions}`).catch((err) => {
            console.log(err);
        });

        // if user is not found return error
        if (!result || result.length === 0) {
            return response.send({ status: false, message: CONFIG.messages.USER_NOT_FOUND });
        }

        // define if user is admin (can change permissions, etc - disabled for the self)
        let isAdmin = false;

        // check if user has permissions to edit the user
        // also check if user is trying to edit himself
        // or if user is trying to edit another user that has lower permissions
        if ((request.session.user.user_permissions >= CONFIG.permissions.administrator && request.session.user.user_permissions > result[0][tableColumns.user_permissions])) {
            canEditUser = true;

            if (request.session.user.user_id !== result[0][tableColumns.user_id]) {
                isAdmin = true;
            }
        }

        const userObject = {
            ...result[0],
            user_created_at: snowflakeIdCreatedAt(result[0].user_id),
        }

        return response.send({ status: true, user: userObject, canEditProfile: canEditUser, isAdmin: isAdmin });
    });

}