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
exports.createDOFromDTOCommand = exports.createDOFromDTO = void 0;
var ts = require("typescript");
var fs = require("fs");
var chalk_1 = require("chalk");
function getEnum(enumName, enums) {
    return "\nexport enum ".concat(enumName, " {\n    ").concat(enums
        .map(function (enumv) {
        return "".concat(enumv.comment ? "/** ".concat(enumv.comment, " */\n") : "").concat(enumv.name, " = ").concat(enumv.value);
    })
        .join(",\n"), "\n}\n");
}
function transJavaType(type) {
    switch (type) {
        case "integer":
        case "float":
        case "long":
        case "double": {
            return "number";
        }
        default: {
            return type.replace("DTO", "DO");
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
    args.name = args.name.replace("DTO", "DO");
    args.basicProps = basicProps.map(function (p) { return (__assign(__assign({}, p), { type: transJavaType(p.type) })); });
    return args;
}
function preProcessSourceFile(sourceFile) {
    var text = "";
    var prevOccurEnum = false;
    ts.forEachChild(sourceFile, function (node) {
        var nodeText = node.getText(sourceFile);
        // console.log(node.kind, "node");
        // console.log(node.getText(sourceFile), "preProcessSourceFile");
        if (node.kind === ts.SyntaxKind.EnumDeclaration) {
            nodeText = nodeText.replace("public ", "");
            prevOccurEnum = true;
            text += "\n".concat(nodeText);
            return;
        }
        if (prevOccurEnum) {
            if (node.kind === ts.SyntaxKind.Block) {
                nodeText = nodeText.replace(/\(/g, " = ");
                nodeText = nodeText.replace(/\)/g, "");
                prevOccurEnum = false;
            }
            else {
                nodeText = "";
            }
        }
        text += nodeText;
    });
    return text;
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
        var processedFileText = preProcessSourceFile(sourceFile_1);
        fs.writeFileSync(tempPath, processedFileText);
        program = ts.createProgram({ rootNames: [tempPath], options: {} });
        sourceFile_1 = program.getSourceFile(tempPath);
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
        // fs.writeFileSync(targetPath, );
        fs.unlinkSync(tempPath);
        return { code: "/** \u672C\u4EE3\u7801\u7531\u5C0F\u5E93\u524D\u7AEFai\u751F\u6210 */".concat(code_1), interfacesArgs: interfacesArgs_1 };
    }
    catch (e) {
        console.log(e, "error");
        fs.unlinkSync(tempPath);
        fs.unlinkSync(targetPath);
    }
}
exports.createDOFromDTO = createDOFromDTO;
function createDOFromDTOCommand(javadtoFielPath) {
    if (!fs.existsSync(javadtoFielPath)) {
        chalk_1.default.red("".concat(javadtoFielPath, " Not Exist!"));
        return;
    }
    var file = fs.readFileSync(javadtoFielPath).toString();
    chalk_1.default.green("jdo end!");
    return createDOFromDTO(file);
}
exports.createDOFromDTOCommand = createDOFromDTOCommand;
