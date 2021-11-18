const webpack = require('webpack');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let Mprocess = null;
let manualRestart = false;

async function bMain() {
  return new Promise((resolve) => {
    const compiler = webpack(require('./webpack.config')('development'));
    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err);
        return;
      }
      if (Mprocess && Mprocess.kill) {
        manualRestart = true;
        process.kill(Mprocess.pid);
        Mprocess = null;
        setTimeout(() => {
          manualRestart = false;
        }, 5000);
      }
      resolve(1);
    });
  });
}

function spawns() {
  let args = ['dist/app.js'];
  if (process.env.npm_execpath.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3));
  } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2));
  }
  Mprocess = spawn('node', args, {
    cwd: path.resolve('./')
  });
  Mprocess.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg)
      console.log(
        `\x1b[34m[main stdout ${new Date().toLocaleTimeString()}]\x1b[0m: \x1b[1m${msg}\x1b[0m`
      );
  });
  Mprocess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg)
      console.log(
        `\x1b[31m[main stderr ${new Date().toLocaleTimeString()}]\x1b[0m: \x1b[1;31m${msg}\x1b[0m`
      );
  });
  Mprocess.on('exit', (e) => {
    start();
  });
  Mprocess.on('close', () => {
    if (!manualRestart) process.exit();
  });
}

function start() {
  bMain().then(() => spawns());
}

start();
