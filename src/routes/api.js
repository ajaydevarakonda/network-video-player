const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const util = require('util');

const fsExists = util.promisify(fs.exists);
const { getFiles } = require('../../lib');

router.get('/ls', async function (req, res) {
    util.log(`/ls`);
    const { rootDirectory } = req.app.locals;
    var { cwd } = req.query;

    if (!cwd)
        cwd = "/";

    const requestedDirectory = path.join(rootDirectory, cwd);

    if (! await fsExists(requestedDirectory)) {
        util.log(`${cwd}: User tried to access a folder that does not exist!`);
        return res.status(400).json({ error: `Folder ${cwd} does not exist!` });
    }

    util.log(`${cwd}: GET list.`);
    return res.json(await getFiles(requestedDirectory));
});

module.exports = router;