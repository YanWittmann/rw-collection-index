const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log('Configuring craco webpack overwrite for', isDevelopment ? 'Development build' : 'Production build');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {

            if (isProduction) {
                // enable production mode optimizations
                webpackConfig.mode = 'production';

                // split vendor chunks
                webpackConfig.optimization = {
                    ...webpackConfig.optimization,
                    splitChunks: {
                        chunks: 'all',
                        minSize: 20000,
                        maxSize: 244000,
                        minChunks: 1,
                        maxAsyncRequests: 30,
                        maxInitialRequests: 30,
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
                            // Specific vendor chunks
                            framerMotion: {
                                test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
                                name: 'framer-motion',
                                chunks: 'all',
                            },
                            radixUI: {
                                test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                                name: 'radix-ui',
                                chunks: 'all',
                            },
                            sanitizeHtml: {
                                test: /[\\/]node_modules[\\/]sanitize-html[\\/]/,
                                name: 'sanitize-html',
                                chunks: 'all',
                            },
                        },
                    },
                };
            }

            // add bundle analyzer in development
            if (isDevelopment) {
                webpackConfig.plugins.push(new BundleAnalyzerPlugin());
            }

            // shadcn-ui uses aliases to import components.
            // react-scripts does not support aliases, so we need to use craco to add them.
            // note that this will not work: module.exports = {webpack: {resolve: {alias: {'@shadcn': path.resolve(__dirname, 'src/@shadcn/')}}}}
            webpackConfig.resolve.alias = {
                ...webpackConfig.resolve.alias,
                '@shadcn': path.resolve(__dirname, 'src/@shadcn/'),
            };

            return webpackConfig;
        },
    },
};