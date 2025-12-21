const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log('Configuring craco webpack overwrite for', isDevelopment ? 'Development build' : 'Production build');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            if (isProduction) {
                // enable production mode optimizations
                webpackConfig.mode = 'production';

                // optimize bundle size
                webpackConfig.optimization = {
                    ...webpackConfig.optimization,
                    splitChunks: {
                        chunks: 'all',
                        // avoid too many tiny files (HTTP/1.1 bottleneck)
                        minSize: 100000,
                        // allow larger chunks (better compression)
                        // maxSize: 244000,
                        minChunks: 1,
                        // Reduce concurrent requests to avoid queueing
                        maxAsyncRequests: 10,
                        maxInitialRequests: 10,
                        cacheGroups: {
                            defaultVendors: {
                                test: /[\\/]node_modules[\\/]/,
                                priority: -10,
                                reuseExistingChunk: true,
                            },
                            default: {
                                minChunks: 2,
                                priority: -20,
                                reuseExistingChunk: true,
                            },
                            // Keep huge libs separate, but combine smaller ones
                            react: {
                                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                                name: 'react',
                                chunks: 'all',
                            },
                        },
                    },
                    usedExports: true,
                    minimize: true,
                    runtimeChunk: 'single',
                    concatenateModules: true,
                    sideEffects: true,
                };

                // add compression plugin
                if (!webpackConfig.plugins) webpackConfig.plugins = [];
                webpackConfig.plugins.push(
                    new CompressionPlugin({
                        algorithm: 'gzip',
                        test: /\.(js|css|html|svg)$/,
                        threshold: 8192,
                        minRatio: 0.8,
                    })
                );

                webpackConfig.performance = {
                    hints: process.env.CI ? false : 'warning',
                    maxEntrypointSize: process.env.CI ? 1024000 : 512000,
                    maxAssetSize: process.env.CI ? 1024000 : 512000,
                };

                webpackConfig.devtool = false;
            }

            // add bundle analyzer in development
            // if (isDevelopment) {
            //     webpackConfig.plugins.push(new BundleAnalyzerPlugin());
            // }

            // shadcn-ui uses aliases to import components
            webpackConfig.resolve.alias = {
                ...webpackConfig.resolve.alias,
                '@shadcn': path.resolve(__dirname, 'src/@shadcn/'),
            };

            return webpackConfig;
        },
    },
};