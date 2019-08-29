const util = require('util');
const fs = require('fs');
const path = require('path');
const ffprobe = require('node-ffprobe');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

const fsLstat = util.promisify(fs.lstat);
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

async function isDirectory(directoryPath) {
    const lstat = await fsLstat(directoryPath)
    return lstat.isDirectory();
}

async function getVideoFiles(directory) {
    var filenames = await fsReadDir(directory);
    var fileList = [];

    for (let filename of filenames) {
        const file_fullPath = path.resolve(path.join(directory, filename))

        if (await isDirectory(file_fullPath)) {
            fileList.push({ foldername: filename });
        } else {
            const probeInfo = await asyncProbe(file_fullPath);
            const isVideo =  isVideoFormat(probeInfo);
            if (isVideo) {
                fileList.push(probeInfo);
            }
        }
    }

    return fileList;
}


module.exports = { getVideoFiles };