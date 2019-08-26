const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');

app.get('/', (req, res) => res.send(new Date().toString()))
app.use('/api', apiRoutes);

app.locals.rootDirectory = process.cwd();

module.exports = app;