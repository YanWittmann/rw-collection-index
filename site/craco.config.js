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

                // optimize bundle size
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
                            // add more specific chunks for large dependencies
                            react: {
                                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                                name: 'react',
                                chunks: 'all',
                            },
                            // add chunks for specific features
                            features: {
                                test: /[\\/]src[\\/]app[\\/]components[\\/]/,
                                name(module) {
                                    // Extract component name from the path
                                    const match = module.context.match(/[\\/]components[\\/]([^\\/]+)[\\/]/);
                                    return match ? `feature-${match[1]}` : 'feature-common';
                                },
                                chunks: 'all',
                            },
                        },
                    },
                    // enable tree shaking
                    usedExports: true,
                    minimize: true,
                    // add runtime chunk
                    runtimeChunk: 'single',
                    // enable module concatenation
                    concatenateModules: true,
                    // enable side effects optimization
                    sideEffects: true,
                };

                // add performance hints
                webpackConfig.performance = {
                    hints: process.env.CI ? false : 'warning',
                    maxEntrypointSize: process.env.CI ? 1024000 : 512000,
                    maxAssetSize: process.env.CI ? 1024000 : 512000,
                };

                // enable source maps for debugging
                webpackConfig.devtool = 'source-map';
            }

            // add bundle analyzer in development
            if (isDevelopment) {
                webpackConfig.plugins.push(new BundleAnalyzerPlugin());
            }

            // shadcn-ui uses aliases to import components
            webpackConfig.resolve.alias = {
                ...webpackConfig.resolve.alias,
                '@shadcn': path.resolve(__dirname, 'src/@shadcn/'),
            };

            return webpackConfig;
        },
    },
};