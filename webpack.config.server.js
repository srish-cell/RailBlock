const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')

// Running on production mode. Note that the prod. folder may be a result of this set configuration.
module.exports = {
    entry: [
        'webpack/hot/poll?1000',
        './src/server/index'
    ],
    watch: true,
    // Environment in which the bundle should run, changes chunk loading behavior and available modules.
    // 'node' is specified here in order to ignore built-in modules like path, fs, etc.
    target: 'node',
    // This is a way to exclude dependencies from output bundles. In other words, these are modules that should not be bundled.
    // When bundling with Webpack for backend, you usually don't want to bundle its node_modules, this is where NodeExternals comes in.
    // It essentially is a library that creates and externals function that ignores all modules in node_modules file when bundling.
    externals: [nodeExternals({
        // This is an array for the externals to be included in the bundle.
        whitelist: ['webpack/hot/poll?1000']
    })],
    module: {
        rules: [{
            test: /\.js?$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }]
    },
     /**
     * By using the plugin `StartServerPlugin('server.js')`, we can start the server at that specific file.
     */ 
    
    plugins: [
        new StartServerPlugin('server.js'),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                "BUILD_TARGET": JSON.stringify('server')
            }
        }),
    ],
    
    /**
    * This is where the script returns back. 
    * 1. `path: path.join(__dirname, "prod/server")` is specifying where the file should be stored. 
    *     In this case it is creating a 'prod' folder with 'server' as a folder inside. 
    *     This is all located under the same directory
    * 2. `filename: 'server.js'` is the file that will be stored in the path defined.
    */

    output: {
        path: path.join(__dirname, 'prod/server'),
        filename: 'server.js'
    }
}