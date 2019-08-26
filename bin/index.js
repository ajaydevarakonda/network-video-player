#! /usr/bin/env node
const app = require('../src/server');
const port = 3333;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
