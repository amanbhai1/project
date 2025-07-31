module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
          extensions: [
            '.ios.js',
            '.android.js',
            '.native.js',
            '.web.js',
            '.js',
            '.ios.ts',
            '.android.ts',
            '.native.ts',
            '.web.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.native.tsx',
            '.web.tsx',
            '.tsx',
            '.json',
          ],
        },
      ],
    ],
  };
};
