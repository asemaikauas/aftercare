const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");
const config = getDefaultConfig(__dirname);
// Metro must also see the real dependency directory when a checkout uses a junction.
const dependencies = fs.realpathSync(path.resolve(__dirname, "node_modules"));
config.watchFolders = [path.resolve(__dirname, ".."), dependencies];
config.resolver.nodeModulesPaths = [dependencies];
module.exports = config;
