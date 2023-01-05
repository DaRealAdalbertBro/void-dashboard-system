module.exports = function (app, db_connection) {
    const CONFIG = require("../../config.json");
    const utils = require("../../utils/proceedData.js")(db_connection);

    app.post("/api/post/transferOwnership", (request, response) => {
        // check if user is logged in and has the highest permissions
        if (!request.session.user) {
            return response.send({ status: 0, message: CONFIG.messages.NOT_LOGGED_IN });
        }



        if (request.session.user.user_permissions < CONFIG.permissions.owner) {
            return response.send({ status: 0, message: CONFIG.messages.INVALID_PERMISSIONS });
        }

        // check if the user exists
        let user_id = request.body.user_id;
        let user_id_transfer = request.body.user_id_transfer;

        if (!user_id || !user_id_transfer) {
            return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
        }

        // try to parse the user id and target user id
        try {
            user_id = parseInt(user_id);
            user_id_transfer = parseInt(user_id_transfer);
        } catch (error) {
            return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
        }

        // check if the user exists
        utils.fetchById(user_id_transfer, CONFIG.database.users_table_columns.user_id).then(async (result) => {
            if (result.length === 0) {
                return response.send({ status: 0, message: CONFIG.messages.USER_NOT_FOUND });
            }

            // check if the user is not the owner
            if (user_id === result[0][CONFIG.database.users_table_columns.user_id]) {
                return response.send({ status: 0, message: CONFIG.messages.NOTHING_TO_UPDATE });
            }

            // transfer the ownership to the target user
            const result1 = await utils.updateUser(user_id_transfer, { user_permissions: CONFIG.permissions.owner })
                .catch((error) => {
                    return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
                });

            // remove permissions from the current owner
            const result2 = await utils.updateUser(user_id, { user_permissions: CONFIG.permissions.administrator })
                .catch((error) => {
                    return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });
                });

            // update the session
            request.session.user.user_permissions = CONFIG.permissions.administrator;

            // check if the update was successful
            if (result1.affectedRows === 1 && result2.affectedRows === 1) {
                return response.send({ status: 1, message: CONFIG.messages.SUCCESS });
            }

            return response.send({ status: 0, message: CONFIG.messages.SOMETHING_WENT_WRONG });

        }).catch((error) => {
            return response.send({ status: 0, message: CONFIG.messages.ERROR });
        });
    });


};