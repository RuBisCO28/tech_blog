module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    return config;
  },
}
