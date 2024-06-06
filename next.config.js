/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    assetPrefix: 'https://gaianet-ai.github.io/chatbot-ui',
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
