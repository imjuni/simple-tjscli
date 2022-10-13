const webpack = require('webpack');
const path = require('path');
const tsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');
const { merge } = require('webpack-merge');
const devConfig = require('./webpack.config.dev');

const appConfig = merge(devConfig[0], {
  resolve: {
    plugins: [
      new tsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.prod.json',
      }),
    ],
  },
});

const cliConfig = merge(devConfig[1], {
  resolve: {
    plugins: [
      new tsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.prod.json',
      }),
    ],
  },
});

module.exports = [appConfig, cliConfig];
