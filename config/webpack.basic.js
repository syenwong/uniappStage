const chalk = require('chalk');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimzerWebpackPlugin = require('css-minimizer-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const styleLoader = require('./styleLoader');
const utils = require('./utils');
const getBabelConfig = require('./babelConfig');
const getEntries = require('./getEntries');
const { VueLoaderPlugin } = require('vue-loader');
const { merge } = require('webpack-merge');
const path = require('path');
module.exports = function webpackBuild (config) {
    const { env, outPutPath, assetsPath, framework, projectSourcePath } = config;
    const babelConfigOptions = getBabelConfig(config);
    const { webpackConfigEnties, HtmlWebpackPlugins } = getEntries(config);
    const webpackConfig = {
        entry: webpackConfigEnties,
        devtool: false,
        output: {
            path: path.resolve(__dirname, '../unity/' + outPutPath),
            filename: assetsPath + '/[name].js' + (config.withHash ? '?[fullhash]' : ''),
            chunkFilename: assetsPath + '/[name].js' + (config.withHash ? '?[fullhash]' : '')
        },
        resolve: {
            extensions: ['.js', 'jsx', '.vue', '.json', '.ts', '.tsx']
            // alias: { 'vue': 'vue/dist/vue.esm.js' }
        },
        module: {
            rules: [
                ...(styleLoader({
                    sourceMap: env !== 'production',
                    usePostCSS: true
                }, config)),
                {
                    test: /\.js|jsx$/,
                    use: {
                        loader: 'babel-loader',
                        options: babelConfigOptions
                    },
                    include: [utils.getRootPath('common'), utils.getRootPath('src'), utils.getRootPath('node_modules/@chjq')]
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 1 * 1
                        }
                    },
                    generator: {
                        filename: assetsPath + '/images/[hash][ext][query]'
                    },
                    include: [utils.getRootPath('common'), utils.getRootPath('src'), utils.getRootPath('node_modules/@chjq')]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: assetsPath + `/[name].css${config.withHash ? '?[fullhash]' : ''}`,
                chunkFilename: assetsPath + `/[name].css${config.withHash ? '?[fullhash]' : ''}`,
                ignoreOrder: true
            }),
            new CssMinimzerWebpackPlugin(),
            new ProgressBarPlugin({
                format: '  building "' + projectSourcePath + '" [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
                clear: true
            }),
            ...HtmlWebpackPlugins
        ],
        performance: {
            // false | "error" | "warning" // ????????????????????? | ????????????????????? | ?????????...
            hints: 'warning',
            // ????????????????????????????????????
            // ??????????????????????????????????????????webpack????????????????????????,????????????,??????????????????
            maxEntrypointSize: (config.env === 'production') ? 30000000 : 500000000,
            // ?????????????????????????????????250000 (bytes)
            maxAssetSize: (config.env === 'production') ? 30000000 : 500000000
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        sourceMap: false // set to true if you want JS source maps,
                    },
                    extractComments: false
                })
            ],
            splitChunks: {
                chunks: 'all',
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                name: false,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'all',
                        name: 'vendor',
                        priority: 10, // ??????
                        enforce: true
                    },
                    common: {
                        test: /[\\/]common[\\/]|[\\/]utils[\\/]/,
                        chunks: 'all',
                        name: 'common',
                        priority: 10, // ??????
                        enforce: true
                    }
                }
            }
        }
    };
    let configByFramework = {
        react: {},
        vue: {
            module: {
                rules: [
                    {
                        test: /\.vue$/,
                        use: {
                            loader: 'vue-loader'
                        },
                        include: [utils.getRootPath('common'), utils.getRootPath('src')]
                    }
                ]
            },
            plugins: [
                new VueLoaderPlugin()
            ]
        }
    };
    // ??????src?????????????????????list;
    // ????????????
    return merge(webpackConfig, configByFramework[framework]);
};
