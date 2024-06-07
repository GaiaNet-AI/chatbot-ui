/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    assetPrefix: process.env.ASSET_PREFIX ? 'https://gaianet-ai.github.io/chatbot-ui' : "/",
    reactStrictMode: true,
    webpack(config, {isServer, dev}) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true
        };

        return config;
    }
};

module.exports = nextConfig;
