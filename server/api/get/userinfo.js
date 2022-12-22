const { snoflakeIdCreatedAt } = require('../../utils/generateID');

module.exports = function (app) {

    app.get('/api/get/userinfo', (request, response) => {
        // check if user is logged in
        if (request.session.user) {
            // create user object
            const userObject = {
                user_name: request.session.user.user_name,
                user_tag: request.session.user.user_tag,
                user_email: request.session.user.user_email,
                user_id: request.session.user.user_id,
                user_permissions: request.session.user.user_permissions,
                user_avatar_url: request.session.user.user_avatar_url,
                user_created_at: snoflakeIdCreatedAt(request.session.user.user_id)
            }

            // send user object
            response.send({
                status: 1,
                user: userObject
            });
        }
        else {
            // if user is not logged in, send status 0 - not logged in
            response.send({ status: 0 });
        }
    });

}