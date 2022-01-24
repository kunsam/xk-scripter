"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDOFromDTO = void 0;
var ts = require("typescript");
var fs = require("fs");
var test = "\npublic class StepComponentDTO extends BaseHatchDTO {\n\n    /** \u53F0\u9636\u7C7B\u578B */\n    private StepComponentType stepType;\n\n    /** \u53F0\u9636\u957F(\u53F0\u9636\u77E9\u5F62\u4E0A\u4E0B\u7684\u8FB9\u957F) */\n    private double length;\n\n    /** \u662F\u5426\u6709\u5E73\u53F0 */\n    private boolean hasPlatform;\n\n    /** \u5E73\u53F0\u5BBD(\u53F0\u9636\u77E9\u5F62\u5DE6\u53F3\u7684\u8FB9\u957F) */\n    private double platformWidth;\n\n    /** \u8E0F\u6B65\u5BBD */\n    private double stepWidth;\n\n    /** \u8E0F\u6B65\u9AD8 */\n    private double stepHeight;\n\n    /** \u8E0F\u6B65\u6570 */\n    private double stepNum;\n\n    /** \u53F0\u9636\u9AD8\u5EA6 */\n    private double selfHeight;\n\n    /** \u53F0\u9636\u9876\u79BB\u5730\u9AD8\u5EA6 */\n    private double groundClearance;\n\n    /** \u680F\u6746\u4F4D\u7F6E */\n    private List<RectEdgePosition> railingPositions;\n\n    /** \u680F\u6746\u914D\u7F6E */\n    private RailingParamsDTO railingParams;\n}\n\npublic enum StepComponentType {\n    /** \u5355\u4FA7\uFF0C\u5FC5\u5B9A\u4E3A\u4E0B */\n    SINGLE = '123',\n    /** \u53CC\u4FA7\u76F8\u90BB\uFF0C\u5FC5\u5B9A\u4E3A\u4E0B\u3001\u53F3 */\n    CLOSED_SIDES = 2,\n    /** \u53CC\u4FA7\u5BF9\u8FB9\uFF0C\u5FC5\u5B9A\u4E3A\u5DE6\u3001\u53F3 */\n    OPPOSITE_SIDES = 3,\n    /** \u4E09\u4FA7\uFF0C\u5FC5\u5B9A\u4E3A\u5DE6\u3001\u4E0B\u3001\u53F3 */\n    THREE_SIDES = 4;\n}\n\n/**\n * \u680F\u6746\n */\npublic class RailingParamsDTO {\n\n  /** \u680F\u6746\u9AD8\u5EA6 \uFF08\u680F\u6746\u9AD8\u5EA6 + \u53CD\u574E\u9AD8\u5EA6 = \u603B\u9AD8\u5EA6\uFF09 */\n  private double railingHeight;\n\n  /** \u53CD\u574E\u9AD8\u5EA6 */\n  private double baseRailHeight;\n\n  /** \u680F\u6746\u540E\u7AEF */\n  private double railingThickness;\n}\n\n";
function getEnum(enumName, enums) {
    return "\nexport enum ".concat(enumName, " {\n    ").concat(enums
        .map(function (enumv) {
        return "".concat(enumv.comment ? "/** ".concat(enumv.comment, " */\n") : "").concat(enumv.name, " = ").concat(enumv.value);
    })
        .join(",\n"), "\n}\n");
}
function transJavaType(type) {
    switch (type) {
        case "double": {
            return "number";
        }
        default: {
            return type;
        }
    }
}
function getInterfaceCode(_a) {
    var name = _a.name, refers = _a.refers, basicProps = _a.basicProps, heritageClause = _a.heritageClause;
    return "\n".concat(refers.map(function (r) { return "".concat(r, "\n"); }), "\nexport interface ").concat(name, " ").concat(heritageClause || "", " {\n    ").concat(basicProps
        .map(function (prop) {
        return "".concat(prop.comment ? "/** ".concat(prop.comment, " */\n") : "").concat(prop.name, ": ").concat(transJavaType(prop.type), ";\n");
    })
        .join(""), "\n}");
}
// export enum StepComponentType {
//     SINGLE(1),
//     /** 双侧相邻，必定为下、右 */
//     CLOSED_SIDES(2),
//     /** 双侧对边，必定为左、右 */
//     OPPOSITE_SIDES(3),
//     /** 三侧，必定为左、下、右 */
//     THREE_SIDES(4);
// }
function isNodeChildrenMatch(kinds, node) {
    var childKinds = [];
    node.forEachChild(function (cnode) {
        childKinds.push(cnode.kind);
    });
    return kinds.reduce(function (p, c) {
        return p && childKinds[c.index] === c.kind;
    }, true);
}
function resolvePropertyDeclaration(node, sourceFile) {
    var _a, _b;
    var props = {
        name: "",
        type: "",
        comment: "",
    };
    if ((_a = node.jsDoc[0]) === null || _a === void 0 ? void 0 : _a.comment) {
        props.comment = ((_b = node.jsDoc[0]) === null || _b === void 0 ? void 0 : _b.comment) || "";
    }
    var isMatch = isNodeChildrenMatch([
        {
            index: 1,
            kind: ts.SyntaxKind.Identifier,
        },
        {
            index: 2,
            kind: ts.SyntaxKind.Identifier,
        },
    ], node);
    var index = 0;
    node.forEachChild(function (cnode) {
        if (!isMatch) {
        }
        else {
            if (index === 1) {
                props.type = cnode.getText(sourceFile);
            }
            if (index === 2) {
                props.name = cnode.getText(sourceFile);
            }
            index += 1;
        }
    });
    return props;
}
function resolveClassDeclaration(node, sourceFile) {
    var isShowed = false;
    var args = {
        name: "",
        heritageClause: "",
        refers: [],
        basicProps: [],
    };
    var prevMatchedType;
    var prevMatchedComment;
    var prevMatchedList = false;
    var prevMatchedListType;
    var basicProps = [];
    node.forEachChild(function (cnode) {
        var _a, _b;
        if (cnode.kind === ts.SyntaxKind.HeritageClause) {
            args.heritageClause = cnode.getText(sourceFile);
            return;
        }
        if (cnode.kind === ts.SyntaxKind.PropertyDeclaration) {
            if (cnode.jsDoc) {
                prevMatchedComment = ((_a = cnode.jsDoc[0]) === null || _a === void 0 ? void 0 : _a.comment) || "";
            }
            if (prevMatchedList && prevMatchedListType) {
                basicProps.push({
                    type: prevMatchedListType,
                    name: cnode.getText(sourceFile).replace(";", ""),
                    comment: prevMatchedComment,
                });
                prevMatchedList = false;
                prevMatchedListType = undefined;
                return;
            }
            cnode.forEachChild(function (ccnode) {
                if (prevMatchedType) {
                    basicProps.push({
                        type: prevMatchedType,
                        name: ccnode.getText(sourceFile),
                        comment: prevMatchedComment,
                    });
                    prevMatchedType = undefined;
                    prevMatchedComment = undefined;
                }
                else {
                    if (ccnode.kind === ts.SyntaxKind.Identifier) {
                        prevMatchedType = ccnode.getText(sourceFile);
                    }
                }
            });
            //   resolvePropertyDeclaration(cnode as ts.PropertyDeclaration, sourceFile);
            return;
        }
        if (cnode.kind === ts.SyntaxKind.MethodDeclaration) {
            if (cnode.jsDoc) {
                prevMatchedComment = ((_b = cnode.jsDoc[0]) === null || _b === void 0 ? void 0 : _b.comment) || "";
            }
            cnode.forEachChild(function (ccnode) {
                if (ccnode.kind === ts.SyntaxKind.Identifier &&
                    ccnode.getText(sourceFile) === "List") {
                    prevMatchedList = true;
                }
                if (prevMatchedList && ccnode.kind === ts.SyntaxKind.TypeParameter) {
                    prevMatchedListType = "".concat(ccnode
                        .getText(sourceFile)
                        .replace(";", ""), "[]");
                }
            });
            return;
        }
        if (cnode.kind === ts.SyntaxKind.Identifier) {
            args.name = cnode.getText(sourceFile);
            return;
        }
    });
    args.basicProps = basicProps;
    return args;
}
function createDOFromDTO(fileContent) {
    var tempPath = "temp.".concat(Math.random().toFixed(8), ".ts");
    var targetPath = "XK_COPY_ME.ts";
    try {
        fs.writeFileSync(tempPath, fileContent);
        var interfacesArgs_1 = [];
        var code_1 = "";
        var program = ts.createProgram({ rootNames: [tempPath], options: {} });
        var sourceFile_1 = program.getSourceFile(tempPath);
        ts.forEachChild(sourceFile_1, function (node) {
            if (ts.isClassDeclaration(node)) {
                var args = resolveClassDeclaration(node, sourceFile_1);
                interfacesArgs_1.push(args);
                // console.log(args, "argsargsargsargs");
                code_1 += getInterfaceCode(args);
                code_1 += "\n";
            }
            if (ts.isEnumDeclaration(node)) {
                var enumName_1 = "";
                var enums_1 = [];
                node.forEachChild(function (cnode) {
                    var _a;
                    if (cnode.kind === ts.SyntaxKind.Identifier) {
                        enumName_1 = cnode.getText(sourceFile_1);
                    }
                    if (cnode.kind === ts.SyntaxKind.EnumMember) {
                        var name_1 = "";
                        var value_1 = "";
                        var comment_1 = ((_a = cnode.jsDoc[0]) === null || _a === void 0 ? void 0 : _a.comment) || "";
                        cnode.forEachChild(function (ccnode) {
                            if (ccnode.kind === ts.SyntaxKind.Identifier) {
                                name_1 = ccnode.getText(sourceFile_1);
                            }
                            if (name_1) {
                                if (ccnode.kind === ts.SyntaxKind.NumericLiteral ||
                                    ccnode.kind === ts.SyntaxKind.StringLiteral) {
                                    value_1 = ccnode.getText(sourceFile_1);
                                    enums_1.push({
                                        comment: comment_1,
                                        name: name_1,
                                        value: value_1,
                                    });
                                }
                            }
                        });
                    }
                });
                code_1 += getEnum(enumName_1, enums_1);
            }
        });
        // console.log(code, "code");
        fs.writeFileSync(targetPath, "/** \u672C\u4EE3\u7801\u7531\u5C0F\u5E93\u524D\u7AEFai\u751F\u6210 */".concat(code_1));
        fs.unlinkSync(tempPath);
    }
    catch (e) {
        console.log(e, "error");
        fs.unlinkSync(tempPath);
        fs.unlinkSync(targetPath);
    }
}
exports.createDOFromDTO = createDOFromDTO;
// createDOFromDTO(test);
