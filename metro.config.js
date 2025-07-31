const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add platform-specific extensions
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Support for platform-specific files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
