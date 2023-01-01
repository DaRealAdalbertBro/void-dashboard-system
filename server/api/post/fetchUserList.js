module.exports = function (app, db_connection) {
    const CONFIG = require("../../config.json");

    app.post("/api/post/fetchUserList", (request, response) => {
        // check if user has permissions to update users
        if (!request.session.user || request.session.user.user_permissions < CONFIG.permissions.administrator) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_PERMISSIONS })
        }

        const tableColumns = CONFIG.database.users_table_columns;

        // query selector, select all columns from users table except for sensitive data
        const querySelector = `SELECT ${tableColumns.user_name}, ${tableColumns.user_tag}, ${tableColumns.user_id}, ${tableColumns.user_avatar_url}, ${tableColumns.user_email}, ${tableColumns.user_permissions}, ${tableColumns.user_banner_color} FROM users`;

        // fetch all users from database and return them
        db_connection.query(querySelector, (error, result) => {
            // if there is an error, return fetch error message
            if (error) {
                return response.send({ status: 0, message: CONFIG.messages.ERROR_FETCHING_DATA })
            }

            // return all users
            return response.send({ status: 1, data: result })
        }); // end of query
    });
}