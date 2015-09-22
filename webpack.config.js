/**
 * @filedescription module webpack config
 */
'use strict';

var webpack = require('webpack');
var path = require('path');

module.exports = {

  output: {
    filename: 'main.js',
    path: __dirname + '/www/build',
    publicPath: 'build/'
  },

  watchOptions: {
    aggregateTimeout: 500
  },

  context: __dirname + '/www',
  devtool: 'cheap-source-map',

  cache: true,
  watch: true,
  debug: true,
  entry: './test.jsx',

  stats: {
    colors: true,
    reasons: true
  },

  resolve: {
    moduleDirectories: ['node_modules'],
    extensions: ['', '.js', '.coffee', '.scss', '.css', '.json', '.jsx'],
    alias: {
      // 'styles': __dirname + '/src/styles',
      // 'mixins': __dirname + '/src/mixins',
      // 'components': __dirname + '/src/components/',
      'react': __dirname + '/node_modules/react/dist/react-with-addons',
      'reactlib': __dirname + '/node_modules/react/lib',

      'underscore': __dirname + '/node_modules/underscore/underscore.js',
      'jquery': __dirname + '/node_modules/jquery/dist/jquery.js',
      bluebird: __dirname + '/node_modules/bluebird/js/browser/bluebird.min',
      'bootstrap': __dirname + '/node_modules/bootstrap',
      'fontawesome': __dirname + '/node_modules/font-awesome',
      'moment': __dirname + '/node_modules/moment/min/moment.min',
      'jquery-translate3d': __dirname + '/node_modules/jquery-translate3d/jquery-translate3d.js',
      'whenjs': __dirname + '/node_modules/when',
      'crypto-js': __dirname + '/node_modules/crypto-js',
      'assets': __dirname + '/www/assets',
      'configuration': __dirname + '/config/config',

      'react-router': __dirname + '/node_modules/react-router/umd/ReactRouter',
      'sensorservice': __dirname + '/node_modules/zland-core/services/DebugService',

      // mock dependencies
      'game/stores/GameStore': __dirname + '/www/mocks/GameStore',
      'generatorSpot/stores/SpotStore': __dirname + '/www/mocks/SpotStore',
      'player/stores/PlayerStore': __dirname + '/www/mocks/PlayerStore',
      'player/components/Player': __dirname + '/www/mocks/Element',
      'crosshair/components/Crosshair': __dirname + '/www/mocks/Element',
      'spotfactories/ComponentFactories': __dirname + '/www/mocks/ComponentFactories',
      'zombie/stores/ZombieStore': __dirname + '/www/mocks/ZombieStore',

      // zland modules
      'core': __dirname + '/node_modules/zland-core',
      'player': __dirname + '/node_modules/zland-player',
      'debugControls': __dirname + '/node_modules/zland-debug-controls',
      'map': __dirname
    }
  },
  module: {
    preLoaders: [],
    loaders: [{
        test: /\.coffee$/,
        loader: "coffee-loader"
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg|woff|woff2|eot|ttf|svg).*$/,
      loader: 'url-loader?limit=8192'
    }, {
      test: /\.(json).*$/,
      loader: 'json-loader'
    }, {
      test: /\.(jsx).*$/,
      loader: 'jsx-loader'
    },

    {
      test: /\.scss$/,
      loader: "style!css!sass?" +
          "includePaths[]=" +
            (path.resolve(__dirname, "./node_modules")) + '&' +
          "includePaths[]=" +
            __dirname
    }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
        "bootstrap": "bootstrap",
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        "_": "underscore"
    })
  ]
};
