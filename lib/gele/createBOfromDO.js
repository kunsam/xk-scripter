"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBOfromDOCommand = exports.standardBOFileTemplate = void 0;
var lodash_1 = require("lodash");
function standardBOFileTemplate(doInerface) {
    var elementName = doInerface.name.replace("DO", "");
    var lowerFirstName = (0, lodash_1.lowerFirst)(elementName);
    var boName = "".concat(elementName, "BO");
    var doName = "".concat(elementName, "DO");
    return "\n/** \u672C\u4EE3\u7801\u7531\u5C0F\u5E93\u524D\u7AEFai\u751F\u6210 */\nimport { generateId } from '@xkool/graphic';\nimport { GeometryBase } from './geometryBase.model';\nimport type {\n    ".concat(doName, ",\n} from '../projectDO/").concat((0, lodash_1.lowerFirst)(doName), ".model';\n\nexport class ").concat(boName, " extends GeometryBase {\n\n    public id: number\n\n    ").concat(doInerface.basicProps
        .map(function (prop) { return "public ".concat(prop.name, ": ").concat(prop.type, ";\n"); })
        .join("\n"), "\n\n    constructor(\n        id: number,\n        doProps: {\n            ").concat(doInerface.basicProps
        .map(function (prop) { return "".concat(prop.name, ": ").concat(prop.type, ","); })
        .join("\n"), "\n        },\n        options: {}\n    ) {\n        super([]);\n        this.id = id;\n        ").concat(doInerface.basicProps
        .map(function (prop) { return "this.".concat(prop.name, " = doProps.").concat(prop.name, ";"); })
        .join("\n"), "\n    }\n\n    public static createByDO(").concat(lowerFirstName, ": ").concat(doName, ") {\n        // NOTICE: GeometryBase\u9ED8\u8BA4 Y\u8F74\u53CD\u8F6C\n        const ").concat(lowerFirstName, "BO = new ").concat(boName, "(\n            ").concat(lowerFirstName, ".id || generateId(),\n            {\n                ").concat(doInerface.basicProps
        .map(function (prop) { return "".concat(prop.name, ": ").concat(lowerFirstName, ".").concat(prop.name); })
        .join(",\n"), "\n            },\n            {}\n        )\n        return ").concat(lowerFirstName, "BO;\n    }\n\n    public clone(needGenerateId: boolean = true): ").concat(boName, " {\n        const ").concat(lowerFirstName, " = new ").concat(boName, "(\n            needGenerateId ? generateId() : this.id,\n            {\n                ").concat(doInerface.basicProps
        .map(function (prop) { return "".concat(prop.name, ": this.").concat(prop.name); })
        .join(",\n"), "\n            },\n            {}\n        );\n        return ").concat(lowerFirstName, ";\n    }\n\n    /*\n    public check(list: CheckedTarget[]) {\n        return true\n    }\n    */\n}\n");
}
exports.standardBOFileTemplate = standardBOFileTemplate;
function createBOfromDOCommand(doInerface) {
    return standardBOFileTemplate(doInerface);
}
exports.createBOfromDOCommand = createBOfromDOCommand;
