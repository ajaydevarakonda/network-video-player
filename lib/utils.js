var os = require("os");
const ifaces = os.networkInterfaces();
const childProcess = require('child_process');

// TODO: convert to function* on setting up babel.
function getIPAddress() {
  var ipAddress = null;

  for (let ifname in ifaces) {
    ifaces[ifname].forEach(function (iface) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if ("IPv4" === iface.family && !iface.internal) {
        ipAddress = iface.address;
        return;
      }
    });

    if (ipAddress) break;
  }

  return ipAddress;
}

async function exec(command) {
  return new Promise(function (resolve, reject) {
    childProcess.exec(command, function (err, stdout, stderr) {
      if (err instanceof Error) {
        reject(err);
      }

      if (stdout) {
        return resolve(stdout);
      } else if (stderr) {
        return reject(stderr);
      }
    });
  });
}

module.exports = { getIPAddress, exec };