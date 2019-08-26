#! /usr/bin/env node
const app = require('../src/server');
const port = 3333;
var os = require('os');
var ifaces = os.networkInterfaces();

// TODO: convert to function* on setting up babel.
function getIPAddress() {
    var ipAddress = null;

    for (let ifname in ifaces) {
        ifaces[ifname].forEach(function (iface) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            if ('IPv4' === iface.family && ! iface.internal) { 
                ipAddress = iface.address;
                return;
            }
        });

        if (ipAddress)
            break;
    }

    return ipAddress;
}

const ipaddress = getIPAddress();
app.listen(port, () => console.log(`Enter http://${ipaddress}:${port}, when app asks!`));
