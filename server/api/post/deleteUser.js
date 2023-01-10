module.exports = function (app, db_connection) {
    const CONFIG = require('../../config.json');
    const utils = require('../../utils/proceedData.js')(db_connection);
    const inputValidator = require('../../utils/validateInput.js')();

    app.post("/api/post/deleteUser", async (request, response) => {
        // check if user is logged in and has the highest permissions
        if (!request.session.user) {
            return response.send({ status: 0, message: CONFIG.messages.NOT_LOGGED_IN });
        }

        // get the user id from the request body
        const user_id = inputValidator.isUserIdValid(request.body.user_id);

        // check if the user id is valid
        if (!user_id.status) {
            return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
        }

        // check permission
        if (request.session.user.user_permissions < CONFIG.permissions.administrator) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_PERMISSIONS });
        }

        // check if the user id exists
        const result = await utils.fetchById(user_id.value).catch(error => {
            console.log(error);
        });

        // if the user id does not exist
        if (!result || result.length === 0) {
            return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
        }

        // check if the user id is the same as the current user id
        // and if the user permissions are lower or the same as the request user permissions    
        if (request.session.user.user_id != result[0][CONFIG.database.users_table_columns.user_id]
            && result[0][CONFIG.database.users_table_columns.user_permissions] >= request.session.user.user_permissions) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_PERMISSIONS });
        }

        // delete the user
        const userDelete = await utils.deleteUser(user_id.value).then(result => result).catch(error => error);

        // if there is an error, return the error
        if (userDelete.status === 0 || userDelete.affectedRows === 0) {
            return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
        }

        let deletedYourself = request.session.user.user_id == result[0][CONFIG.database.users_table_columns.user_id];

        // if the user id is the same as the current user id, clear the session
        if (deletedYourself) {
            request.session.destroy();
        }

        // return success message
        return response.send({ status: 1, message: CONFIG.messages.USER_DELETED, deletedYourself: deletedYourself });

    }); // end of app.post

}