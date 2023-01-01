module.exports = function (app) {

    const CONFIG = require('../../config.json');

    app.post('/api/post/logout', (request, response) => {
        request.session.destroy();
        return response.send({ status: 1, message: CONFIG.messages.LOGOUT_SUCCESSFUL });
    });

}