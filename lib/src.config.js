"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PACKAGE_BASE_PATH = exports.PACKAGE_VERSION = undefined;

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var packJson = require("../package.json");

// 命令行执行路径
var PACKAGE_VERSION = exports.PACKAGE_VERSION = packJson.version;
// export const PROJECT_BASE_PATH = shell.pwd().stdout
var PACKAGE_BASE_PATH = exports.PACKAGE_BASE_PATH = _path2.default.join(__dirname, "../");