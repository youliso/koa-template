const webpack = require("webpack");
const main = require('./webpack.main.config');
const {writeFileSync} = require('fs');
const pack = require('./package.json');
webpack([
    {...main}
], (err, stats) => {
    if (err || stats.hasErrors()) {
        // 在这里处理错误
        throw err;
    }
    let data = {
        name: pack.name,
        version: pack.version,
        dependencies: pack.dependencies
    }
    writeFileSync('./dist/package.json', JSON.stringify(data, null, 2));
});
