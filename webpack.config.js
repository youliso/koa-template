const webpack = require("webpack");
const {writeFileSync} = require('fs');
const pack = require('./package.json');
const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const _externals = require('externals-dependencies');
const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = process.env.NODE_ENV === 'development';
webpack([
    {
        devtool: isEnvDevelopment ? 'source-map' : false,
        mode: isEnvProduction ? 'production' : 'development',
        target: "node",
        externals: _externals(),
        context: __dirname,
        node: {
            global: true,
            __filename: true,
            __dirname: true,
        },
        entry: {
            "app": [
                './src/app.ts'
            ]
        },
        output: {
            filename: '[name].js',
            path: path.resolve('dist')
        },
        optimization: {
            minimize: true
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve('resources'),
                        to: path.resolve('dist/resources')
                    }
                ]
            })
        ]
    }
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
