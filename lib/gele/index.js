"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatorAllElementCodeInPrime = void 0;
var fs = require("fs");
var path = require("path");
var createDOfromDTO_1 = require("./createDOfromDTO");
var chalk_1 = require("chalk");
var createBOfromDO_1 = require("./createBOfromDO");
var lodash_1 = require("lodash");
var guide_1 = require("./guide");
var leftMenuOptions_1 = require("./leftMenuOptions");
var createCanvasObject_1 = require("./createCanvasObject");
var DEFAULT_PATH_CONFIG = {
    javadtoPath: "xkGele/javadto.ts",
    configPath: "xkGele/xele.config.json",
    svgFolderPath: "xkGele/svg",
    guidePath: "xkGele/guide.md",
    svgAssetFolderPath: "packages/dt/src/assets",
    modelFilePath: "packages/dt/src/models/project/projectDO",
    modelBOFilePath: "packages/dt/src/models/project/projectBO",
    canvasObjectPath: "packages/dt/src/2dRenderer/canvasObjects",
    leftMenuConfigPath: "packages/dt/src/models/project/tag",
};
function makeSureWrite(filepath, fileName, code) {
    var doFilePath = path.join(filepath, fileName);
    if (fs.existsSync(doFilePath)) {
        var number = new Date().getTime().toString().slice(0, 5);
        doFilePath = path.join(filepath, "".concat(number, ".").concat(fileName));
        chalk_1.default.green("".concat(fileName, " exist! use a new filename: ").concat(number, ".").concat(fileName));
    }
    fs.writeFileSync(doFilePath, code);
}
function readConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        throw new Error("".concat(configPath, " Not Exist!"));
        return;
    }
    var configText = fs.readFileSync(configPath).toString();
    return JSON.parse(configText);
}
function generatorAllElementCodeInPrime() {
    try {
        var userConfig_1 = readConfig(DEFAULT_PATH_CONFIG.configPath);
        var config = Object.assign(userConfig_1, {
            pathConfig: Object.assign(DEFAULT_PATH_CONFIG, userConfig_1.pathConfig || {}),
        });
        console.log(config, "configconfig");
        var _a = (0, createDOfromDTO_1.createDOFromDTOCommand)(config.pathConfig.javadtoPath), code = _a.code, interfacesArgs = _a.interfacesArgs;
        var lowerFirstElementName = (0, lodash_1.lowerFirst)(userConfig_1.elementName);
        // write DO
        makeSureWrite(config.pathConfig.modelFilePath, "".concat(lowerFirstElementName, "DO.model.ts"), code);
        // write BO
        var findDoInerface = interfacesArgs.find(function (arg) {
            return arg.name.includes(userConfig_1.elementName);
        });
        if (findDoInerface) {
            var boCode = (0, createBOfromDO_1.createBOfromDOCommand)(findDoInerface);
            makeSureWrite(config.pathConfig.modelBOFilePath, "".concat(lowerFirstElementName, "BO.model.ts"), boCode);
        }
        // canvasObject
        var canvasObjectCode = (0, createCanvasObject_1.createCanvasObjectCommand)(lowerFirstElementName);
        makeSureWrite(config.pathConfig.canvasObjectPath, "XK".concat((0, lodash_1.upperFirst)(userConfig_1.elementName), "CanvasObject.ts"), canvasObjectCode);
        // options
        var leftOptionsCode = (0, leftMenuOptions_1.createLeftMenuOptionsCommand)(lowerFirstElementName, userConfig_1.elementType, config.pathConfig.svgFolderPath, config.pathConfig.svgAssetFolderPath);
        makeSureWrite(config.pathConfig.leftMenuConfigPath, "".concat(lowerFirstElementName, ".ts"), leftOptionsCode);
        // guide
        fs.writeFileSync(config.pathConfig.guidePath, (0, guide_1.createGuideCommand)({
            enumName: userConfig_1.elementType.enumTypeName,
        }));
    }
    catch (e) {
        console.log(e, "Error in generatorAllElementCodeInPrime");
    }
}
exports.generatorAllElementCodeInPrime = generatorAllElementCodeInPrime;
