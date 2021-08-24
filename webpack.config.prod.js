const webpack = require('webpack');
const path = require('path');
const tsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');
const webpackNodeExternals = require('webpack-node-externals');

const distPath = path.resolve(path.join(__dirname, 'dist'));

const config = {
  devtool: 'inline-source-map',  
  externals: [
    webpackNodeExternals({
      allowlist: ['tslib'],
    }),
  ],
  mode: 'production',
  target: 'node',

  cache: {
    // 1. Set cache type to filesystem
    type: 'filesystem',

    buildDependencies: {
      // 2. Add your config as buildDependency to get cache invalidation on config change
      config: [__filename],

      // 3. If you have other things the build depends on you can add them here
      // Note that webpack, loaders and all modules referenced from your config are automatically added
    },
  },

  resolve: {
    fallback: {
      __dirname: false,
      __filename: false,
      console: false,
      global: false,
      process: false,
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    plugins: [
      new tsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.prod.json',
      }),
    ],
  },

  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
  ],

  entry: {
    'tjscli': ['./src/tjscli.ts'],
  },

  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs',
    path: distPath,
  },

  optimization: {
    minimize: true, // <---- disables uglify.
    // minimizer: [new UglifyJsPlugin()] if you want to customize it.
  },

  module: {
    rules: [
      {
        loader: 'json-loader',
        test: /\.json$/,
      },
      {
        exclude: /node_modules/,
        loader: 'ts-loader',
        test: /\.tsx?$/,
        options: {
          configFile: 'tsconfig.prod.json',
        }
      },
      // {
      //   exclude: /node_modules/,
      //   loader: 'shebang-loader',
      //   test: /\.tsx?$/,
      // },
    ],
  },
};

module.exports = config;
