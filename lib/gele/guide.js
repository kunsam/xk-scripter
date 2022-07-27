"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuideCommand = void 0;
var path = require("path");
function getPath(rpath) {
    return path.join(process.cwd(), rpath);
}
function createGuideCommand(_a) {
    var enumName = _a.enumName;
    return "\n        # \u6DFB\u52A0 DO export\n        file://".concat(getPath("packages/dt/src/models/project/projectDO/index.ts"), "\n\n        // todo \u53EF\u4EE5\u5728 packages/dt/src/enums \u4E0B\u6DFB\u52A0\u9ED8\u8BA4\u914D\u7F6E\n\n        # \u6DFB\u52A0 BO export\n        file://").concat(getPath("packages/dt/src/models/project/projectBO/index.ts"), "\n\n        # \u6DFB\u52A0 CanvasObject export\n        file://").concat(getPath("packages/dt/src/2dRenderer/canvasObjects/index.ts"), "\n\n        # \u6DFB\u52A0 Options export\n        file://").concat(getPath("packages/dt/src/models/project/tag/index.ts"), "\n\n        \n        # \u641C\u7D22 [GTODO:leftMenuOptions]: \u628A\u8FD9\u6BB5\u4EE3\u7801\u653E\u5230\n        file://").concat(getPath("packages/dt-web/src/pages/Project/components/ObjectCreatePanel/ObjectCreatePanel.tsx"), "\n\n        # \u641C\u7D22 [").concat(enumName, "]: \u628A\u4EE3\u7801\u653E\u5230 ComponentOptionTypeUnion \u4E2D\n        file://").concat(getPath("packages/dt/src/models/project/tag/component.ts"), "\n\n    ");
}
exports.createGuideCommand = createGuideCommand;
