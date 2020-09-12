const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = process.env.NODE_ENV === 'development';
module.exports = {
    devtool: isEnvDevelopment ? 'source-map' : false,
    mode: isEnvProduction ? 'production' : 'development',
    target: "async-node",
    entry: './src/app.ts',
    output: {
        filename: '[name].js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve('dist')
    },
    node: {
        __filename: false,
        __dirname: false
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
};
