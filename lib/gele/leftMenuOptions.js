"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeftMenuOptionsCommand = exports.createLeftMenuOptions = void 0;
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
function createLeftMenuOptions(name, elementType) {
    return "\n/** \u672C\u4EE3\u7801\u7531\u5C0F\u5E93\u524D\u7AEFai\u751F\u6210 */\nimport type { ComponentOption } from './component';\n".concat(elementType.enumNames
        .map(function (type) {
        return "import l_".concat(type.enumName, " from '../../../assets/").concat(name, "/light/").concat(type.enumName, ".svg'");
    })
        .join("\n"), "\n").concat(elementType.enumNames
        .map(function (type) {
        return "import d_".concat(type.enumName, " from '../../../assets/").concat(name, "/dark/").concat(type.enumName, ".svg'");
    })
        .join("\n"), "\n\n// GTODO:leftMenuOptions\nexport const ").concat(name, "Options: ComponentOption[] = [\n    ").concat(elementType.enumNames
        .map(function (type) { return "{\n        label: '".concat(type.fullName, "',\n        type: ").concat(elementType.enumTypeName, ".").concat(type.enumName, ",\n        size: [],\n        icon: d_").concat(type.enumName, ",\n        dark: d_").concat(type.enumName, ",\n        light: l_").concat(type.enumName, "\n    }"); })
        .join(",\n"), "\n]\n\n");
}
exports.createLeftMenuOptions = createLeftMenuOptions;
function createLeftMenuOptionsCommand(name, elementType, svgFolderPath, svgAssetPath) {
    if (fs.existsSync(path.join(svgFolderPath, "白"))) {
        fs.renameSync(path.join(svgFolderPath, "白"), path.join(svgFolderPath, "light"));
        fs.renameSync(path.join(svgFolderPath, "黑"), path.join(svgFolderPath, "dark"));
        elementType.enumNames.forEach(function (data) {
            fs.renameSync(path.join(svgFolderPath, "light", "".concat(data.name, ".svg")), path.join(svgFolderPath, "light", "".concat(data.enumName, ".svg")));
            fs.renameSync(path.join(svgFolderPath, "dark", "".concat(data.name, ".svg")), path.join(svgFolderPath, "dark", "".concat(data.enumName, ".svg")));
        });
    }
    fse.copySync(svgFolderPath, path.join(svgAssetPath, "/".concat(name)));
    return createLeftMenuOptions(name, elementType);
}
exports.createLeftMenuOptionsCommand = createLeftMenuOptionsCommand;
