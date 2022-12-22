// import database config from config file
const config = require('../config.json').database;

module.exports = function (db_connection) {
    const users_table_name = config.users_table_name;
    const config_user_id = config.users_table_columns.user_id;
    const config_user_name = config.users_table_columns.user_name;
    const config_user_tag = config.users_table_columns.user_tag;
    const config_user_email = config.users_table_columns.user_email;
    const config_user_password_hash = config.users_table_columns.user_password_hash;


    const userExists = (user_name, user_tag) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${config_user_name} FROM ${users_table_name} WHERE ${config_user_name} = ? AND ${config_user_tag} = ?`,
                [user_name, user_tag],
                (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                }
            );
        });
    };

    const registerUser = (user_id, user_name, user_tag, user_email, user_password_hash) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `INSERT INTO ${users_table_name} (${config_user_id}, ${config_user_name}, ${config_user_tag}, ${config_user_email}, ${config_user_password_hash}) VALUES (?, ?, ?, ?, ?)`,
                [user_id, user_name, user_tag, user_email, user_password_hash],
                (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                }
            );
        });
    };

    const idExists = (user_id) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${config_user_id} FROM ${users_table_name} WHERE ${config_user_id} = ?`,
                [user_id],
                (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                }
            );
        });
    };

    const idOrUsernameExists = (user_id, user_name, user_tag) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${config_user_id} FROM ${users_table_name} WHERE ${config_user_id} = ? OR (${config_user_name} = ? AND ${config_user_tag} = ?)`,
                [user_id, user_name, user_tag],
                (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                }
            );
        });
    };

    const emailOrUsernameExists = (user_name, isUsernameEmail = false, selector = config_user_id) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${selector} FROM ${users_table_name} WHERE ${isUsernameEmail ? config_user_email : config_user_name} = ?`,
                [user_name],
                (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                }
            );
        });
    };


    const emailExists = (user_email) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${config_user_email} FROM ${users_table_name} WHERE ${config_user_email} = ?`,
                [user_email],
                (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                }
            );
        });
    };

    const insertNewUser = (user_id, user_name, user_tag, user_email, user_password_hash) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `INSERT INTO ${users_table_name} (${config_user_id}, ${config_user_name}, ${config_user_tag}, ${config_user_email}, ${config_user_password_hash}) VALUES (?, ?, ?, ?, ?)`,
                [user_id, user_name, user_tag, user_email, user_password_hash],
                (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                }
            );
        });
    };


    const storeDataInSession = (request, user_id, user_name, user_tag, user_email, user_permissions, user_avatar_url) => {
        try {
            // store user data in session
            request.session.user = {
                user_name: user_name,
                user_tag: user_tag,
                user_email: user_email,
                user_id: user_id,
                user_permissions: user_permissions,
                user_avatar_url: user_avatar_url,
            };
        }
        catch (error) {
            console.log(error);
            return false;
        }

        // return true if no error
        return true;
    }


    return {
        // GET / SELECT
        userExists,
        registerUser,
        idExists,
        emailExists,
        idOrUsernameExists,
        emailOrUsernameExists,

        // INSERT
        insertNewUser,
        storeDataInSession,
    };

}
