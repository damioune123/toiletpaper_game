const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports =(env, argv) => {
    const isDevelopment = argv.mode === 'development';
    /* Webpack config */
    return ({
        mode: argv.mode,
        devtool: isDevelopment ? 'inline-source-map': 'source-map',
        entry: './src/js/app.js',
        output: {
            path: path.join(__dirname, 'dist'),
            publicPath: "/",
            filename: 'bundle.min.js'
        },
        devServer: {
            stats: {
                children: false,
                maxModules: 0
            },
            port: 3001
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    loaders: [
                        'style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.ttf$/,
                    loaders: [
                        'url-loader'
                    ]
                },
                {
                    test: /\.(svg|gif|png|eot|woff|ttf)$/,
                    loaders: [
                        'url-loader'
                    ]
                },
                {
                    test: /\.js/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    }
                },
            ]
        },
        plugins: [
            new CopyWebpackPlugin([{
                from: './*.html'
            }])
        ]
    })
};
