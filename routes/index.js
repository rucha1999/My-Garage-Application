const testRoutes = require('./test');

const constructorMethod = (app) => {
    app.use('/', testRoutes);
    app.use('*', (req, res) => {
        res.status(404).json({error: 'Not found.'});
    });
};

module.exports = constructorMethod;