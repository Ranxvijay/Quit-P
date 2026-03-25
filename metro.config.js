const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix: @expo/metro-runtime uses require() on getDevServer expecting a plain CJS function,
// but react-native 0.81 exports it as ESM (export default), so require() returns
// { default: fn } instead of fn itself — causing "getDevServer is not a function" crash.
// Redirect ALL requires of getDevServer to our shim (except from the shim itself).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native/Libraries/Core/Devtools/getDevServer' &&
    !context.originModulePath.includes('shims/getDevServer')
  ) {
    return {
      filePath: path.resolve(__dirname, 'shims/getDevServer.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
