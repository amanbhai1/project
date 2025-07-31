const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add platform-specific extensions
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Support for platform-specific files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Exclude React Native Firebase packages on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add blockList for web platform
if (process.env.EXPO_PUBLIC_PLATFORM === 'web') {
  config.resolver.blockList = [
    /@react-native-firebase\/.*/,
    /react-native-firebase/,
  ];
}

module.exports = config;
