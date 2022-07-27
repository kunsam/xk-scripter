"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanvasObjectCommand = exports.createCanvasObject = void 0;
var lodash_1 = require("lodash");
function createCanvasObject(name) {
    var upperFirstName = (0, lodash_1.upperFirst)(name);
    var Ctype = (0, lodash_1.snakeCase)((0, lodash_1.camelCase)(name))
        .split("_")
        .map(function (v) { return (0, lodash_1.toUpper)(v); })
        .join("_");
    return "\nimport { CanvasObjectTypeEnum } from './../../enums/canvasObject';\nimport type { ".concat(upperFirstName, "BO } from './../../models/project/projectBO/").concat(name, "BO.model';\nimport { CanvasGroup } from './CanvasGroup';\n\ninterface XK").concat(upperFirstName, "CanvasObjectData {\n    value: ").concat(upperFirstName, "BO;\n    [key: string]: any;\n}\n\nexport class XK").concat(upperFirstName, "CanvasObject extends CanvasGroup {\n\n    constructor(\n        ").concat(name, ": ").concat(upperFirstName, "BO,\n        objectList: fabric.Object[],\n        data: XK").concat(upperFirstName, "CanvasObjectData,\n    ) {\n        super(\n            objectList,\n            stepComponent.id,\n            CanvasObjectTypeEnum.").concat(Ctype, ", // GTODO: \u8DF3\u8F6C\u58F0\u660E\u4E00\u4E0B\n            data,\n            undefined,\n            undefined,\n            undefined,\n            true,\n        );\n        this.data = data;\n    }\n\n    private static getObjectList(").concat(name, ": ").concat(upperFirstName, "BO) {\n        const objectList: fabric.Object[] = [];\n        // GTODO: \u5199\u4E00\u4E0B\u5BF9\u8C61\u521B\u5EFA\u903B\u8F91\n        return objectList\n    }\n\n\n    public static createByBO(").concat(name, ": ").concat(upperFirstName, "BO) {\n        const objList = this.getObjectList(").concat(name, ")\n        return new XK").concat(upperFirstName, "CanvasObject(\n            ").concat(name, ",\n            objList,\n            { value: ").concat(name, " },\n        );\n    }\n}\n        \n");
}
exports.createCanvasObject = createCanvasObject;
function createCanvasObjectCommand(name) {
    return createCanvasObject(name);
}
exports.createCanvasObjectCommand = createCanvasObjectCommand;
