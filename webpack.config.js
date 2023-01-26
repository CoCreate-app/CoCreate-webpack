const path = require("path")
// const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

let isProduction = process.env.NODE_ENV === "production"

module.exports = {
  entry: {
    code: "./src/code.js",
    ui: './src/index.js'
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProduction ? "[name].js" : "[name].js",
  },

  mode: isProduction ? "production" : "development",
  module: {
    rules: [
      { 
        test: /\.tsx?$/, 
        use: 'ts-loader', 
        exclude: /node_modules/
      },
      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      { 
        test: /\.css$/, 
        use: ["style-loader", "css-loader"],
      },
      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      // { test: /\.(png|jpg|gif|webp|svg|zip)$/, loader: [{ loader: 'url-loader' }] }
      { 
        test: /\.svg/,
        type: 'asset/inline'
      }
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'global': {} // Fix missing symbol error when running in developer VM
    }),

    new HtmlWebpackPlugin({
      // inject: "body",
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['ui']
    }),
    // new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/]),
  ]

}
