#! /usr/bin/env node
const app = require("../src/server");
var os = require("os");
var ifaces = os.networkInterfaces();
const yargs = require("yargs");
const ngrok = require("ngrok");

const port = 3333;

// TODO: convert to function* on setting up babel.
function getIPAddress() {
  var ipAddress = null;

  for (let ifname in ifaces) {
    ifaces[ifname].forEach(function(iface) {
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

(async function() {
  try {
    const ipaddress = getIPAddress();
    const argv = yargs.boolean("enable-tunnel").argv;
    var tunnelIp = null;

    if (argv["enable-tunnel"]) {
      tunnelIp = await ngrok.connect({
        addr: port
      });
    }

    process.on("exit", async function() {
      await ngrok.kill();
    });

    app.listen(port, () => {
      console.log(`Enter http://${ipaddress}:${port}, when app asks.`);
      if (tunnelIp) {
        console.log(
          `Enter ${tunnelIp} if your computer and mobile are on different network.`
        );
      }
    });
  } catch (err) {
    if (process.env.ENV === "DEV") console.log(err);
    else console.error("Something went wrong!");
  }
})();
