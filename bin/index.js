#! /usr/bin/env node
const app = require("../src/server");
var os = require("os");
var ifaces = os.networkInterfaces();
const yargs = require("yargs");
const ngrok = require("ngrok");
const childProcess = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const debug = require('debug')('main')

const port = 3333;

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

// handles all exits
const ExitHandler = {
  callbacks: [],

  /**
   * Calls all callbacks and exits if asked.
   * @param {*} options   { exit: Boolean }, if exit is set to true, will call process exit at end of calling all on exit callbacks.
   * @param {*} exitCode  exit code returned by the system event.
   */
  _onexit(options, exitCode) {
    this.callbacks.forEach(cb => cb.call());

    // will not exit automaticall for Interrups, so we'll have to exit.
    if (options.exit) {
      process.exit(1);
    }
  },

  /**
   * Attaches exit handlers for the first time.
   */
  config() {
    // will not configure again.
    if (this._configured) return;

    process.on('exit', this._onexit.bind(null));
  
    // catches ctrl+c event
    process.on('SIGINT', this._onexit.bind(null, { exit: true }));
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', this._onexit.bind(null, { exit: true }));
    process.on('SIGUSR2', this._onexit.bind(null, { exit: true }));
    // catches uncaught exceptions
    process.on('uncaughtException', this._onexit.bind(null, { exit: true }));

    this._configured = true;
    return;
  },
  _configured: false,
}

// add to exit handler callbacks.
function beforeExit(cb) {
  ExitHandler.config();
  ExitHandler.callbacks.push(cb);
}

(async function () {
  try {
    // ---------------------------------- setup ------------------------------------------
    const ipaddress = getIPAddress();
    const argv = yargs.boolean("enable-tunnel").argv;
    var tunnelIp = null;

    if (argv["enable-tunnel"]) {
      tunnelIp = await ngrok.connect({
        addr: port
      });
    }

    process.on("exit", async function () {
      await ngrok.kill();
    });

    // check if the process is run with sudo
    if (!process.getuid || process.getuid() !== 0) {
      console.error(`Error: Script should be run with superuser priviliges!`);
      console.error(`sudo nvp <options>`);
      process.exit(1);
    }

    if (process.platform.match(/linux/)) {
      const osDetails_str = await exec('hostnamectl');

      debug(`Opening port 3333 on your 'fedora' os...`);
      if (osDetails_str.match(/fedora/)) {
        // need not close port again, this is a temporary open, restart will reset this setting.
        const execRes = await exec(`sudo firewall-cmd --add-port=3333/tcp`);
        if (execRes.match(/success/)) {
          debug(`Successfully opened port 3333 on your 'fedora' os!`);
        }
      }
    }

    // ---------------------------------- listen -----------------------------------------
    app.listen(port, () => {
      console.log(`Enter http://${ipaddress}:${port}, when app asks.`);
      if (tunnelIp) {
        console.log(
          `Enter ${tunnelIp} if your computer and mobile are on different network.`
        );
      }
    });
  } catch (err) {
    debug(err);
    console.error("Something went wrong!");
  }
})();
