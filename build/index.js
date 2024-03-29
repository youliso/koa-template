const path = require('path');
const fs = require('fs');
const pack = require('../package.json');
const webpack = require('webpack');
const main = require('./webpack.config'); //主进程

function deleteFolderRecursive(url) {
  let files = [];
  if (fs.existsSync(url)) {
    files = fs.readdirSync(url);
    files.forEach(function (file, index) {
      let curPath = path.join(url, file);
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(url);
  } else {
    console.log('...');
  }
}
deleteFolderRecursive(path.resolve('dist')); //清除dist
const cfg = main('production');
for (const i in pack.dependencies) cfg.externals[i] = `require("${i}")`;
webpack([cfg], (err, stats) => {
  if (err || stats.hasErrors()) {
    throw err;
  }
  fs.writeFileSync(
    path.resolve('./dist/package.json'),
    JSON.stringify(
      {
        name: pack.name,
        version: pack.version,
        scripts: {
          start: 'node app.js'
        },
        dependencies: pack.dependencies
      },
      null,
      2
    )
  );
  console.log('ok');
});
