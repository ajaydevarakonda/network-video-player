/**
 * Contains code for express server setup application.
 */

const express = require('express');
const app = express();
const serveStatic = require('serve-static');
const apiRoutes = require('./routes/api');

app.locals.rootDirectory = process.cwd();

app.get('/', (req, res) => res.send(new Date().toString()))
app.use('/api', apiRoutes);
app.use('/static', serveStatic(app.locals.rootDirectory))

module.exports = app;