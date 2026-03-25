const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix: @expo/metro-runtime@4.0.1 uses require() expecting CJS exports,
// but react-native 0.81 exports modules as ESM (export default).
// We redirect the entire messageSocket.native module to a patched version
// that correctly accesses .default on all require() calls.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    context.originModulePath.includes('@expo/metro-runtime') &&
    moduleName.includes('messageSocket')
  ) {
    return {
      filePath: path.resolve(__dirname, 'shims/messageSocket.native.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
