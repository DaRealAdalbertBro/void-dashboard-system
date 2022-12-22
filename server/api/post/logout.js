module.exports = function (app) {

    app.post('/api/post/logout', (request, response) => {
        request.session.destroy();
        return response.send({ message: 'Logged out', status: 1 });
    });

}