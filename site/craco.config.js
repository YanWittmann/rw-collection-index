const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log('Configuring craco webpack overwrite for', isDevelopment ? 'Development build' : 'Production build');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {

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