// import database config from config file
const CONFIG = require('../config.json');

// import bcrypt for encryption
const bcrypt = require('bcrypt');

// export functions as module
module.exports = function (db_connection) {
    const users_table_name = CONFIG.database.users_table_name;
    const users_table_columns = CONFIG.database.users_table_columns;
    const config_user_id = CONFIG.database.users_table_columns.user_id;
    const config_user_name = CONFIG.database.users_table_columns.user_name;
    const config_user_tag = CONFIG.database.users_table_columns.user_tag;
    const config_user_email = CONFIG.database.users_table_columns.user_email;
    const config_user_password_hash = CONFIG.database.users_table_columns.user_password_hash;

    const idOrUsernameExists = (user_id, user_name, user_tag) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${config_user_id} FROM ${users_table_name} WHERE ${config_user_id} = ? OR (${config_user_name} = ? AND ${config_user_tag} = ?)`,
                [user_id, user_name, user_tag],
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(result);
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
                        return reject(error);
                    }
                    else {
                        return resolve(result);
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
                        return reject(error);
                    }
                    else {
                        return resolve(result);
                    }
                }
            );
        });
    };


    const storeDataInSession = (request,
        user_id, user_name, user_tag, user_email,
        user_permissions = CONFIG.defaults.DEFAULT_PERMISSIONS,
        user_avatar_url = CONFIG.defaults.DEFAULT_AVATAR_URL,
        user_banner_color = CONFIG.defaults.DEFAULT_BANNER_COLOR) => {
        try {
            // store user data in session
            request.session.user = {
                user_name: user_name,
                user_tag: user_tag,
                user_email: user_email,
                user_id: user_id,
                user_permissions: user_permissions,
                user_avatar_url: user_avatar_url,
                user_banner_color: user_banner_color
            };
        }
        catch (error) {
            console.log(error);
            return false;
        }

        // return true if no error
        return true;
    }

    const fetchById = (user_id, selector = '*') => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${selector} FROM ${users_table_name} WHERE ${config_user_id} = ?`,
                [user_id],
                (error, result) => {
                    if (error) {
                        console.log(error)
                        reject(error);
                    }
                    else {
                        console.log(result)
                        resolve(result);
                    }
                }
            );
        });
    };

    const fetchByName = (user_name, user_tag, selector = '*') => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${selector} FROM ${users_table_name} WHERE ${config_user_name} = ? AND ${config_user_tag} = ?`,
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

    const fetchByEmail = (user_email, selector = '*') => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${selector} FROM ${users_table_name} WHERE ${config_user_email} = ?`,
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

    const updateUser = (user_id, updateObject) => {
        return new Promise((resolve, reject) => {
            // check if updateObject is empty
            if (Object.keys(updateObject).length === 0) {
                reject('updateObject is empty');
                return;
            }

            // create query
            let updateQuery = `UPDATE ${users_table_name} SET `;
            let updateValues = [];

            for (let key in updateObject) {
                updateQuery += `${users_table_columns[key] || key} = ?, `;
                updateValues.push(updateObject[key]);
            }

            updateQuery = updateQuery.slice(0, -2);
            updateQuery += ` WHERE ${config_user_id} = ?`;
            updateValues.push(user_id);

            db_connection.query(
                updateQuery,
                updateValues,
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(result);
                    }
                }
            );
        });
    }

    const fetchPasswordById = (user_id) => {
        return new Promise((resolve, reject) => {
            db_connection.query(
                `SELECT ${config_user_password_hash} FROM ${users_table_name} WHERE ${config_user_id} = ?`,
                [user_id],
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(result);
                    }
                }
            );
        });
    };

    const comparePasswords = (old_password_entered, old_password_hash) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(old_password_entered, old_password_hash, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        });
    }

    const hashPassword = (password) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, CONFIG.encryption.SALT_ROUNDS, (error, hash) => {
                if (error) {
                    return reject(error);
                }

                return resolve(hash);
            });
        });
    }

    return {
        // GET / SELECT
        idOrUsernameExists,
        emailOrUsernameExists,
        fetchById,
        fetchByName,
        fetchByEmail,
        fetchPasswordById,

        // INSERT
        insertNewUser,
        storeDataInSession,
        updateUser,

        // OTHER ACTIONS
        comparePasswords,
        hashPassword,
    };

}
