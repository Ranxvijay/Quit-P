const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix: @expo/metro-runtime uses require() on getDevServer expecting CJS,
// but react-native 0.81 exports it as ESM (export default).
// This shim returns just the default function so it's callable.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native/Libraries/Core/Devtools/getDevServer' &&
    context.originModulePath.includes('@expo/metro-runtime')
  ) {
    return {
      filePath: path.resolve(__dirname, 'shims/getDevServer.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
