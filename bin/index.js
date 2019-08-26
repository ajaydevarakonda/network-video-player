#! /usr/bin/env node
const util = require('util');
const fs = require('fs');
const path = require('path');
const ffprobe = require('node-ffprobe');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

const fsReadDir = util.promisify(fs.readdir);
async function asyncProbe(track) {
    return new Promise(function(resolve, reject) {
        ffprobe.FFPROBE_PATH = ffprobeInstaller.path;
        ffprobe(track, (err, probeData) => {
            resolve(probeData);
        });
    });
}

const videoCodecs = [ 'h264' ];

/**
 * Checks if a file is a video, given the file probe information.
 * @param {Object} fileProbeInfo File probe information.
 * @returns {Boolean}
 */
function isVideoFormat(fileProbeInfo) {
    if (! fileProbeInfo || ! fileProbeInfo.streams || ! fileProbeInfo.streams.length)
        return false;
    const videoStreams = fileProbeInfo.streams.filter(stream => videoCodecs.includes(stream.codec_name));
    return videoStreams && videoStreams.length;
}

async function getVideoFiles(directory) {
    var filenames = await fsReadDir(directory);
    var videoFiles = [];

    for (let filename of filenames) {
        const probeInfo = await asyncProbe(path.resolve(filename));
        const isVideo =  isVideoFormat(probeInfo);
        if (isVideo) {
            videoFiles.push(probeInfo);
        }
    }

    return videoFiles;
}

(async function __main() {
    var currentDir = process.cwd();
    const videoFiles= await getVideoFiles(currentDir);
    
    process.exit(0);
})();
