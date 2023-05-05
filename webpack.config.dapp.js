const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Running on development mode
module.exports = {
  entry: ['babel-polyfill', path.join(__dirname, "src/dapp")],
  
  /**
   * This is where the script returns back. 
   * 1. `path: path.join(__dirname, 'prod/dapp')` is specifying where the file should be stored. 
   *     In this case it is creating a 'prod' folder with 'dapp' as a folder inside. 
   *     This is all located under the same directory
   * 2. `filename: "bundle.js"` is the file that will be stored in the path defined.
   */

  output: {
    path: path.join(__dirname, 'prod/dapp'),
    filename: "bundle.js"
  },
  module: {
    rules: [
    {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.html$/,
        use: "html-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ 
      template: path.join(__dirname, "src/dapp/index.html")
    }),
    new HtmlWebpackPlugin({ 
      filename: 'railway.html',
      template: path.join(__dirname, "src/dapp/railway.html")
    }),
    new HtmlWebpackPlugin({ 
      filename: 'passenger.html',
      template: path.join(__dirname, "src/dapp/passenger.html")
    }),
    new HtmlWebpackPlugin({ 
      filename: 'about.html',
      template: path.join(__dirname, "src/dapp/about.html")
    })
  ],
  resolve: {
    extensions: [".js"]
  },
  
  devServer: {
    contentBase: path.join(__dirname, "dapp"),
    port: 8000,
    stats: "minimal"
  }
};
