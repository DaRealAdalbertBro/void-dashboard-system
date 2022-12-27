const { snowflakeIdCreatedAt } = require('../../utils/generateID');

module.exports = function (app) {
    const CONFIG = require('../../config.json');

    app.get('/api/get/userinfo', (request, response) => {
        // check if user is logged in
        if (request.session.user) {
            // create user object
            const userObject = {
                ...request.session.user,
                user_created_at: snowflakeIdCreatedAt(request.session.user.user_id)
            }

            // send user object
            return response.send({
                status: 1,
                user: userObject
            });
        }
        
        // if user is not logged in, send status 0 - not logged in
        return response.send({ status: 0, message: CONFIG.messages.NOT_LOGGED_IN });

    });

}