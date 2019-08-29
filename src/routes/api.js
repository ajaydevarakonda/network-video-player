const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const util = require('util');

const fsExists = util.promisify(fs.exists);
const { getVideoFiles } = require('../../lib');

router.get('/ls', async function(req, res) {
    const { rootDirectory } = req.app.locals; 
    var { cwd } = req.query;

    if (!cwd)
        cwd = "/";

    const requestedDirectory = path.join(rootDirectory, cwd);

    if (! await fsExists(requestedDirectory))
        throw new Error(`Folder ${cwd} does not exist!`);

    res.json(await getVideoFiles(requestedDirectory));
});

module.exports = router;