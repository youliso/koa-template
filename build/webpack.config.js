const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports = (env) => {
  return {
    mode: env,
    target: 'node',
    node: {
      global: false,
      __dirname: false,
      __filename: false
    },
    entry: {
      app: './src/index.ts'
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[id].bundle.js',
      path: path.resolve('dist')
    },
    optimization: {
      minimize: env === 'production',
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'esnext'
        })
      ]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'esbuild-loader',
          options: {
            loader: 'ts',
            target: 'esnext'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        dist: path.resolve('dist'),
        '@': path.resolve('src')
      }
    },
    plugins: [
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
};
