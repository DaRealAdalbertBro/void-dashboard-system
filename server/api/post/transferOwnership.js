module.exports = function (app, db_connection) {
    const CONFIG = require("../../config.json");
    const utils = require("../../utils/proceedData.js")(db_connection);
    const inputValidator = require('../../utils/validateInput.js')();

    app.post("/api/post/transferOwnership", async (request, response) => {
        // check if user is logged in and has the highest permissions
        if (!request.session.user) {
            return response.send({ status: 0, message: CONFIG.messages.NOT_LOGGED_IN });
        }

        if (request.session.user.user_permissions < CONFIG.permissions.owner) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_PERMISSIONS });
        }

        // check if the user exists
        const user_id = inputValidator.isUserIdValid(request.body.user_id);
        const user_id_transfer = inputValidator.isUserIdValid(request.body.user_id_transfer);

        if (!user_id.status || !user_id_transfer.status) {
            return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
        }


        // check if the user exists
        const result = await utils.fetchById(user_id_transfer.value, CONFIG.database.users_table_columns.user_id).catch((error) => {
            console.log(error)
        });

        if (!result || result.length === 0) {
            return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
        }

        // check if the user is not the owner
        if (user_id.value === result[0][CONFIG.database.users_table_columns.user_id]) {
            return response.send({ status: 0, message: CONFIG.messages.NOTHING_TO_UPDATE });
        }

        // transfer the ownership to the target user
        const result1 = await utils.updateUser(user_id_transfer.value, { user_permissions: CONFIG.permissions.owner })
            .catch((error) => {
                console.log(error);
            });

        // remove permissions from the current owner
        const result2 = await utils.updateUser(user_id.value, { user_permissions: CONFIG.permissions.administrator })
            .catch((error) => {
                console.log(error);
            });

        // check if the update was successful
        if (result1.affectedRows === 1 && result2.affectedRows === 1) {
            request.session.user.user_permissions = CONFIG.permissions.administrator;
            return response.send({ status: 1, message: CONFIG.messages.SUCCESS });
        }


        return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
    });


};