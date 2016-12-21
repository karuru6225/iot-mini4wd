const webpack = require('webpack');
const env = process.env.NODE_ENV;

const webpackConfig = {
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  },
  plugins: [],
  target: 'node',
  externals: [
    /^(?!^\.\/)/,
    /config\.js/
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          'presets':['es2015']
        }
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  },
  node: {
    fs: 'empty'
  }
};

if(env == 'production'){
  webpackConfig['plugins'].push(
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  );
}else{
  webpackConfig['devtool'] = '#source-map';
}

module.exports = webpackConfig;
