"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
var graphology_1 = require("graphology");
// export interface XKOOL_PACKAGE_MAP
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
var programMap = new Map();
function getProgramFromPackage(packageName) {
    if (!XKOOL_PACKAGE_MAP[packageName]) {
        return;
    }
    if (!programMap.has(packageName)) {
        programMap.set(packageName, ts.createProgram({
            rootNames: [XKOOL_PACKAGE_MAP[packageName]],
            options: {},
        }));
    }
    return programMap.get(packageName);
}
function getResolvedPath(currentFileName, relativePath) {
    var purePath = relativePath.replace(/\'/g, '');
    if (purePath.startsWith('@/')) {
        var prefixPath = currentFileName.match(/^(.)+frontend_prime\/packages\/.+?\//)[0];
        var filename = getWithExtFilename(path.join(prefixPath, 'src', purePath.replace(/\@\//g, '')));
        return filename;
    }
    return getWithExtFilename(path.join(currentFileName, purePath));
}
function getWithExtFilename(filename) {
    if (fs.existsSync(filename))
        return filename;
    if (fs.existsSync("".concat(filename, ".ts")))
        return "".concat(filename, ".ts");
    if (fs.existsSync("".concat(filename, ".tsx")))
        return "".concat(filename, ".tsx");
    if (fs.existsSync("".concat(filename, "/index.ts")))
        return "".concat(filename, "/index.ts");
    if (fs.existsSync("".concat(filename, "/index.tsx")))
        return "".concat(filename, "/index.tsx");
    return filename;
}
function getImportMap(sourceFile) {
    var map = new Map();
    ts.forEachChild(sourceFile, visit);
    function visit(node) {
        var path = '';
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            var cnode = node.getChildAt(3, sourceFile);
            if (cnode.kind === ts.SyntaxKind.StringLiteral) {
                path = cnode.getText(sourceFile);
            }
        }
        if (path) {
            var cnode = node.getChildAt(1, sourceFile);
            if (cnode.kind === ts.SyntaxKind.ImportClause) {
                var isAsType_1 = cnode.getChildAt(0, sourceFile).kind === ts.SyntaxKind.TypeKeyword;
                var ccnode = cnode.getChildren().find(function (n) { return n.kind === ts.SyntaxKind.NamedImports; });
                if (ccnode) {
                    ccnode.forEachChild(function (cccnode) {
                        cccnode.forEachChild(function (ccccnode) {
                            if (ccccnode.kind === ts.SyntaxKind.Identifier) {
                                var isReletivePath = path.startsWith("'@/") || path.startsWith("'./") || path.startsWith("'../");
                                map.set(ccccnode.getText(sourceFile), {
                                    path: path,
                                    isAsType: isAsType_1,
                                    isReletivePath: isReletivePath,
                                    isPackage: !isReletivePath,
                                });
                            }
                        });
                    });
                }
            }
        }
    }
    return map;
}
function searchCommentNextNodes(comment, sourceFile) {
    var nodes = [];
    ts.forEachChild(sourceFile, visit);
    function visit(node) {
        var isFind = false;
        var commentRanges = ts.getLeadingCommentRanges(sourceFile.getFullText(), node.getFullStart());
        if (commentRanges === null || commentRanges === void 0 ? void 0 : commentRanges.length) {
            var commentStrings = commentRanges.map(function (r) {
                return sourceFile.getFullText().slice(r.pos, r.end);
            });
            if (commentStrings.find(function (string) { return string.includes(comment); })) {
                nodes.push(node);
                isFind = true;
            }
        }
        if (!isFind) {
            ts.forEachChild(node, visit);
        }
    }
    return nodes;
}
function getFunctionName(node, sourceFile) {
    var name = '';
    ts.forEachChild(node, function (cnode) {
        if (name)
            return;
        if (cnode.kind === ts.SyntaxKind.VariableDeclarationList) {
            ts.forEachChild(cnode, function (cnode2) {
                if (cnode2.kind === ts.SyntaxKind.VariableDeclaration) {
                    ts.forEachChild(cnode2, function (cnode3) {
                        if (name)
                            return;
                        if (cnode3.kind === ts.SyntaxKind.Identifier) {
                            name = cnode3.getFullText(sourceFile);
                        }
                    });
                }
            });
        }
        if (name)
            return;
        if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
            if (cnode.kind === ts.SyntaxKind.Identifier) {
                name = cnode.getFullText(sourceFile);
            }
        }
    });
    return name;
}
function getNodeBySymbol(symbol, sourceFile) {
    var findNode;
    var visit = function (fnode) {
        if (findNode)
            return;
        if (fnode.kind === ts.SyntaxKind.Identifier) {
            if (fnode.getText(sourceFile) === symbol) {
                findNode = fnode;
            }
        }
        if (findNode)
            return;
        ts.forEachChild(fnode, visit);
    };
    ts.forEachChild(sourceFile, visit);
    return findNode;
}
function getFunctionDeclaration(functionSymbol, sourceFile) {
    var findFunctionDeclaration;
    var visitfindSourceFile = function (fnode) {
        if (findFunctionDeclaration)
            return;
        if (fnode.kind === ts.SyntaxKind.FunctionDeclaration) {
            var functionDeclarationID_1 = '';
            fnode.forEachChild(function (ffnode) {
                if (ffnode.kind === ts.SyntaxKind.Identifier) {
                    functionDeclarationID_1 = ffnode.getText(sourceFile);
                }
            });
            if (functionDeclarationID_1 && functionDeclarationID_1 === functionSymbol) {
                findFunctionDeclaration = fnode;
            }
        }
        if (findFunctionDeclaration)
            return;
        ts.forEachChild(fnode, visitfindSourceFile);
    };
    ts.forEachChild(sourceFile, visitfindSourceFile);
    if (findFunctionDeclaration) {
        console.log('findFunctionDeclaration', findFunctionDeclaration);
    }
    return findFunctionDeclaration;
}
function getNodeAllVariableDeclarationMap(node, sourceFile) {
    var nodeMap = new Map();
    ts.forEachChild(node, visit);
    function visit(cnode) {
        if (cnode.kind === ts.SyntaxKind.VariableDeclaration) {
            var child1 = cnode.getChildAt(0, sourceFile);
            nodeMap.set(child1.getText(sourceFile), cnode);
            return;
        }
        ts.forEachChild(cnode, visit);
    }
    return nodeMap;
}
function getPackageNameFromFileName(filename) {
    var strings = filename.match(/frontend_prime\/packages\/.+?\//);
    return "@xkool/".concat(strings[0].replace(/frontend_prime\/packages\//, '').replace(/\/$/, ''));
}
function getCallNodeSourceFile(callNode, sourceFile, program, importMap) {
    var _a, _b, _c;
    var callNodeSymbolText = callNode.getText(sourceFile);
    var data = program.getTypeChecker().getTypeAtLocation(callNode);
    var symbol = data.getSymbol();
    if (!symbol) {
        var importData = importMap.get(callNodeSymbolText);
        if (importData && importData.isReletivePath) {
            var purePath = importData.path.replace(/\'/g, '');
            if (purePath.startsWith('@/')) {
                var prefixPath = sourceFile.fileName.match(/^(.)+frontend_prime\/packages\/.+?\//)[0];
                var filename = getWithExtFilename(path.join(prefixPath, 'src', purePath.replace(/\@\//g, '')));
                var program2 = ts.createProgram({
                    rootNames: [filename],
                    options: {},
                });
                var data2 = program2.getTypeChecker().getTypeAtLocation(callNode);
                var symbol2 = data2.getSymbol();
                console.log('symbol2:', symbol2);
                return { sourceFile: program2.getSourceFile(filename) };
            }
        }
        else {
        }
        return undefined;
    }
    var fileName = symbol.valueDeclaration.getSourceFile().fileName;
    console.log(fileName, 'fileName');
    var packageProgram = getProgramFromPackage(getPackageNameFromFileName(fileName));
    if (packageProgram) {
        var findSourceFile = packageProgram
            .getSourceFiles()
            .filter(function (x) { return !x.fileName.includes('node_modules'); })
            .find(function (source) { return source.getFullText(source).includes(callNodeSymbolText); });
        if (findSourceFile) {
            var findNode = getNodeBySymbol(callNodeSymbolText, findSourceFile);
            if (findNode) {
                var findNodeType = packageProgram.getTypeChecker().getTypeAtLocation(findNode.parent);
                var targetSourceFile = (_a = findNodeType.getSymbol().valueDeclaration) === null || _a === void 0 ? void 0 : _a.getSourceFile();
                var parentClassSymbol = void 0;
                if (findNodeType.getSymbol().valueDeclaration.parent.kind === ts.SyntaxKind.ClassDeclaration) {
                    parentClassSymbol = (_c = packageProgram
                        .getTypeChecker()
                        .getTypeAtLocation((_b = findNodeType.getSymbol().valueDeclaration) === null || _b === void 0 ? void 0 : _b.parent)) === null || _c === void 0 ? void 0 : _c.getSymbol().escapedName.toString();
                }
                if (targetSourceFile) {
                    return {
                        sourceFile: targetSourceFile,
                        parentClassSymbol: parentClassSymbol,
                    };
                }
            }
        }
    }
    return undefined;
}
function getClassCallPaths(program, callID, node, callPaths) {
    var _a, _b;
    if (ts.isClassDeclaration(node)) {
        var findMemember = node.members.find(function (me) { var _a; return ((_a = me.name) === null || _a === void 0 ? void 0 : _a.getText()) === callID; });
        if (findMemember) {
            callPaths.push({
                callSymbol: callID,
                parentClassSymbol: (_a = node.name) === null || _a === void 0 ? void 0 : _a.getText(),
                originalFileName: node.getSourceFile().fileName,
            });
        }
        var findHeritageNode_1;
        (_b = node.heritageClauses) === null || _b === void 0 ? void 0 : _b.forEach(function (clause) {
            clause.forEachChild(function (cchild) {
                var _a;
                if (ts.isExpressionWithTypeArguments(cchild)) {
                    var child = cchild.getChildAt(0);
                    var type = program.getTypeChecker().getTypeAtLocation(child);
                    findHeritageNode_1 = (_a = type.getSymbol()) === null || _a === void 0 ? void 0 : _a.valueDeclaration;
                }
            });
        });
        if (findHeritageNode_1) {
            return getClassCallPaths(program, callID, findHeritageNode_1, callPaths);
        }
        return callPaths;
    }
    else if (ts.isMethodDeclaration(node)) {
        return getClassCallPaths(program, callID, node.parent, callPaths);
    }
    else if (ts.isMethodSignature(node)) {
        var parent_1 = node.parent;
        while (parent_1) {
            if (ts.isVariableDeclaration(parent_1)) {
                callPaths.push({
                    callSymbol: callID,
                    parentClassSymbol: parent_1.getChildAt(0).getText(),
                    originalFileName: node.getSourceFile().fileName,
                });
                parent_1 = undefined;
                break;
            }
            if (ts.isSourceFile(parent_1)) {
                break;
            }
            parent_1 = parent_1.parent;
        }
    }
    else {
        callPaths.push({
            callSymbol: callID,
            originalFileName: node.getSourceFile().fileName,
        });
    }
    return callPaths;
}
function getCallExpressionsCallFrom(node, sourceFile, program) {
    var _a, _b;
    var child1 = node.getChildAt(0, sourceFile);
    var callNode;
    var parentCallNode;
    if (child1.kind === ts.SyntaxKind.PropertyAccessExpression) {
        parentCallNode = child1.getChildAt(0, sourceFile);
        callNode = child1.getChildAt(2, sourceFile);
    }
    else if (child1.kind === ts.SyntaxKind.Identifier) {
        var child2 = node.getChildAt(1, sourceFile);
        if (child2.kind === ts.SyntaxKind.OpenParenToken) {
            callNode = child1;
            parentCallNode = child1;
        }
    }
    var callNodeText = callNode.getText(sourceFile);
    var parentCallNodeText = parentCallNode.getText(sourceFile);
    if (callNode) {
        console.log(callNodeText, parentCallNodeText, 'callNode');
        var type = program.getTypeChecker().getTypeAtLocation(callNode);
        if ((_a = type.getSymbol()) === null || _a === void 0 ? void 0 : _a.valueDeclaration) {
            var callPaths = getClassCallPaths(program, callNode.getText(sourceFile), (_b = type.getSymbol()) === null || _b === void 0 ? void 0 : _b.valueDeclaration, []);
        }
        else {
            var callSigns = program.getTypeChecker().getTypeAtLocation(callNode).getCallSignatures();
            if (callSigns.length && callSigns[0].declaration) {
                var callPaths = getClassCallPaths(program, callNode.getText(sourceFile), callSigns[0].declaration, []);
            }
            else {
                // 这种情况使用import路径和两个symbol去追踪
                // if (!type.getSymbol()?.valueDeclaration) {
                //   let parent: ts.Node | undefined = callNode;
                //   console.log('!!!!!!!');
                //   while (parent) {
                //     const ctype = program.getTypeChecker().getTypeAtLocation(parent);
                //     const cfilename = ctype.getSymbol()?.valueDeclaration.getSourceFile().fileName;
                //     if (cfilename && cfilename !== sourceFile.fileName) {
                //       console.log(
                //         ctype.getSymbol()?.valueDeclaration.getSourceFile().fileName,
                //         'type.getSymbol()?.valueDeclaration.getSourceFile().fileName',
                //       );
                //       parent = undefined;
                //       break;
                //     }
                //     parent = parent.parent;
                //   }
                // }
                // const importNames: ts.Node[] = [];
                // sourceFile.forEachChild((cnode) => {
                //   if (ts.isImportDeclaration(cnode)) {
                //     const dname = cnode.importClause?.name?.getText(sourceFile);
                //     if (dname && (dname === callNodeText || dname === parentCallNodeText)) {
                //       importNames.push(cnode.importClause?.name);
                //     }
                //     cnode.importClause.namedBindings?.forEachChild((name) => {
                //       if (
                //         name.getText(sourceFile) === callNodeText ||
                //         name.getText(sourceFile) === parentCallNodeText
                //       ) {
                //         importNames.push(name);
                //       }
                //     });
                //   }
                // });
                // // 尝试了很多方法，居然没法使用program直接获取type. 只能这样搜索了
                // const findSourceFiles = program
                //   .getSourceFiles()
                //   .filter((x) => !x.fileName.includes('node_modules') && !x.fileName.includes('dist'))
                //   .forEach((source) => {
                //     if (source.fileName === sourceFile.fileName) return;
                //     const node = getNodeBySymbol(callNode.getText(sourceFile), source);
                //     const csymbol = program.getTypeChecker().getSymbolAtLocation(node);
                //     console.log(csymbol?.valueDeclaration?.getSourceFile().fileName, 'findType');
                //     if (node) {
                //       const callPaths = getClassCallPaths(program, callNode.getText(sourceFile), node, []);
                //       console.log(callPaths, 'callPaths');
                //     }
                //   });
            }
        }
    }
    return undefined;
}
function getCallExpressions(nodes, sourceFile, program, disableCallIDs, callStacks) {
    //   const variableDeclarationMap = getNodeAllVariableDeclarationMap(sourceFile, sourceFile);
    var callExpressions = [];
    // TODO 返回的结果里需要获取初始调用的信息
    nodes.forEach(function (node) {
        ts.forEachChild(node, visit);
    });
    function visit(node, lastCallID) {
        // 被函数体包裹的不递归
        if (!disableCallIDs.find(function (did) { return did === lastCallID; })) {
            if (node.kind === ts.SyntaxKind.ArrowFunction ||
                node.kind === ts.SyntaxKind.FunctionDeclaration) {
                return;
            }
        }
        var nextLastCallID = '';
        if (node.kind === ts.SyntaxKind.CallExpression) {
            var callID_1 = node.getChildAt(0, sourceFile).getText(sourceFile);
            if (!disableCallIDs.find(function (did) { return did === callID_1; })) {
                callExpressions.push(node);
                var data = getCallExpressionsCallFrom(node, sourceFile, program);
                console.log(data, 'CallExpression');
                console.log('\n\n');
                // 不递归这里
                return;
            }
            else {
                nextLastCallID = callID_1;
            }
        }
        ts.forEachChild(node, function (n) { return visit(n, nextLastCallID); });
    }
    return callExpressions;
}
function excute(_a) {
    var rootNames = _a.rootNames;
    var program = ts.createProgram({ rootNames: rootNames, options: {} });
    var importedRelatedFiles = new Set();
    rootNames.forEach(function (rootName) {
        var sourceFile = program.getSourceFile(rootName);
        var importMap = getImportMap(sourceFile);
        importMap.forEach(function (value) {
            if (!value.isAsType && value.isReletivePath) {
                importedRelatedFiles.add(getResolvedPath(rootName, value.path));
            }
        });
    });
    var importProgram = ts.createProgram({
        rootNames: __spreadArray(__spreadArray([], rootNames, true), Array.from(importedRelatedFiles), true),
        options: {
            declaration: true,
            declarationMap: true,
        },
    });
    var graph = new graphology_1.default();
    rootNames.forEach(function (rootName) {
        var sourceFile = importProgram.getSourceFile(rootName);
        var nodes = searchCommentNextNodes('#CA.Track.Entry:', sourceFile);
        var functionNames = nodes.map(function (node) { return getFunctionName(node, sourceFile); });
        console.log('CA Track Symbols:', functionNames);
        // const importMap = getImportMap(sourceFile);
        var callExpressions = getCallExpressions(nodes, sourceFile, importProgram, ['useEffect', 'useCallback', 'useRef'], []);
        // const graphs: Graph[] = [];
        // callExpressions.forEach((cnode) => {
        //   // const xkPackagePath = XKOOL_PACKAGE_MAP[cnode]
        //   let callID: string = '';
        //   let lastCallID: string = '';
        //   if (cnode.getChildAt(0).kind === ts.SyntaxKind.PropertyAccessExpression) {
        //     const cnodCoount = cnode.getChildAt(0).getChildCount();
        //     const lastCcnode = cnode.getChildAt(0).getChildAt(cnodCoount - 1);
        //     if (lastCcnode.kind === ts.SyntaxKind.Identifier) {
        //       lastCallID = lastCcnode.getText(sourceFile);
        //     }
        //     const ccnode = cnode.getChildAt(0).getChildAt(0);
        //     if (ccnode.kind === ts.SyntaxKind.Identifier) {
        //       callID = ccnode.getText(sourceFile);
        //     }
        //     if (ccnode.kind === ts.SyntaxKind.NonNullExpression) {
        //       const cccnode = ccnode.getChildAt(0);
        //       if (cccnode.kind === ts.SyntaxKind.Identifier) {
        //         callID = cccnode.getText(sourceFile);
        //       }
        //     }
        //     if (ccnode.kind === ts.SyntaxKind.PropertyAccessExpression) {
        //       const cccnode = ccnode.getChildAt(0);
        //       if (cccnode.kind === ts.SyntaxKind.Identifier) {
        //         callID = ccnode.getText(sourceFile);
        //       }
        //     }
        //   }
        //   console.log(callID, lastCallID, 'cnode');
        //   console.log(cnode.getText(sourceFile), '\n\n');
        // });
    });
}
excute({
    rootNames: [path.join(__dirname, '../../../dt-web/src/hooks/walls/useAddWall.ts')],
});
