const webpack = require("webpack");

const main = require('./webpack.main.config');

webpack([
    {...main}
], (err, stats) => {
    if (err || stats.hasErrors()) {
        // 在这里处理错误
        throw err;
    }
    console.log(stats)
});
