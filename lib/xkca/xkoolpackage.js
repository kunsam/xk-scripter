"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXkoolProgramAllValidSourceFiles = exports.getXkoolProgram = exports.getProgramFromPackage = void 0;
var ts = require("typescript");
var path = require("path");
var XKOOL_PACKAGE_MAP = {
    '@xkool/app-runner': path.join(__dirname, '../../../app-runner/src/index.ts'),
    '@xkool/core': path.join(__dirname, '../../../core/src/index.ts'),
    '@xkool/dt': path.join(__dirname, '../../../dt/src/index.ts'),
    '@xkool/dt3d': path.join(__dirname, '../../../dt3d/src/index.ts'),
    '@xkool/graphic': path.join(__dirname, '../../../graphic/src/index.ts'),
    '@xkool/icons': path.join(__dirname, '../../../icons/src/index.ts'),
    '@xkool/ui': path.join(__dirname, '../../../ui/src/index.ts'),
    '@xkool/utils': path.join(__dirname, '../../../utils/src/index.ts'),
};
var XKOOL_CONTAINER_MAP = {
    '@xkool/dt-web': path.join(__dirname, '../../../dt-web/src/index.ts'),
};
var programMap = new Map();
function getProgramFromPackage(xkoolPackageFileName) {
    if (!programMap.has(xkoolPackageFileName)) {
        programMap.set(xkoolPackageFileName, ts.createProgram({
            rootNames: [xkoolPackageFileName],
            options: {},
        }));
    }
    return programMap.get(xkoolPackageFileName);
}
exports.getProgramFromPackage = getProgramFromPackage;
var xkoolProgram;
function getXkoolProgram() {
    if (xkoolProgram) {
        return xkoolProgram;
    }
    var rootNames = Object.values(__assign(__assign({}, XKOOL_PACKAGE_MAP), XKOOL_CONTAINER_MAP));
    var xp = ts.createProgram({
        rootNames: rootNames,
        options: { declaration: false, sourceMap: false },
    });
    xkoolProgram = xp;
    return xp;
}
exports.getXkoolProgram = getXkoolProgram;
function getXkoolProgramAllValidSourceFiles() {
    return getXkoolProgram()
        .getSourceFiles()
        .filter(function (x) { return !x.fileName.includes('node_modules') && !x.fileName.includes('dist'); });
}
exports.getXkoolProgramAllValidSourceFiles = getXkoolProgramAllValidSourceFiles;
