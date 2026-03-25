// Shim: @expo/metro-runtime uses require() on this file expecting a CJS default export,
// but RN 0.81 uses ESM. This shim bridges the gap.
module.exports = require('react-native/Libraries/Core/Devtools/getDevServer').default;
