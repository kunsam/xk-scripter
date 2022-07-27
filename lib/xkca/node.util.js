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
exports.getFunctionDeclarationBySymbol = exports.getNodeBySymbol = exports.getCallExpressionGraphIDs = void 0;
var ts = require("typescript");
var file_util_1 = require("./file.util");
function getClassCallPaths(program, callID, node, callPaths) {
    var _a, _b;
    if (ts.isClassDeclaration(node)) {
        var findMemember = node.members.find(function (me) { var _a; return ((_a = me.name) === null || _a === void 0 ? void 0 : _a.getText()) === callID; });
        if (findMemember) {
            callPaths.push({
                nodeSymbol: callID,
                parentCallSymbol: (_a = node.name) === null || _a === void 0 ? void 0 : _a.getText(),
                fileName: node.getSourceFile().fileName,
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
                    nodeSymbol: callID,
                    parentCallSymbol: parent_1.getChildAt(0).getText(),
                    fileName: node.getSourceFile().fileName,
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
            nodeSymbol: callID,
            fileName: node.getSourceFile().fileName,
        });
    }
    return callPaths;
}
function getNodeReturnClass(node, sourceFile, program) {
    var _a;
    var findClassID;
    if (ts.isNewExpression(node)) {
        var targetid = node.getChildAt(1, sourceFile);
        if (ts.isIdentifier(targetid)) {
            findClassID = targetid;
        }
    }
    else if (ts.isCallExpression(node)) {
        var checker = program.getTypeChecker();
        var edec = (_a = checker.getTypeAtLocation(node.expression).getSymbol()) === null || _a === void 0 ? void 0 : _a.valueDeclaration;
        if (edec && (ts.isArrowFunction(edec) || ts.isFunctionDeclaration(edec))) {
            findClassID = getFunctionCallReturnClass(edec, sourceFile, program);
        }
    }
    return findClassID;
}
function getInstanceClass(instanceId, sourceFile, program) {
    var findClassID;
    ts.forEachChild(sourceFile, visit);
    function visit(node) {
        if (ts.isVariableStatement(node)) {
            var findSameId = node.declarationList.declarations.find(function (dec) { return dec.name.getText(sourceFile) === instanceId; });
            if (findSameId) {
                node.declarationList.declarations.find(function (dec) {
                    // dec is VariableDeclaration
                    var child2 = dec.getChildAt(2, sourceFile);
                    findClassID = getNodeReturnClass(child2, sourceFile, program);
                    if (findClassID) {
                        return true;
                    }
                });
                if (findClassID) {
                    return;
                }
            }
        }
        ts.forEachChild(node, visit);
    }
    return findClassID;
}
function getPropertyDeclarationReturnClass(node, sourceFile, program) {
    var findEqualTokenIndex = node
        .getChildren()
        .findIndex(function (c) { return c.kind === ts.SyntaxKind.EqualsToken; });
    if (findEqualTokenIndex >= 0) {
        var child = node.getChildAt(findEqualTokenIndex + 1, sourceFile);
        if (child) {
            return getNodeReturnClass(child, sourceFile, program);
        }
    }
    return undefined;
}
function getFunctionCallReturnClass(fnode, sourceFile, program) {
    var findClassID;
    ts.forEachChild(fnode, visit);
    function visit(node) {
        if (ts.isReturnStatement(node)) {
            var child1 = node.getChildAt(1, sourceFile);
            if (ts.isNewExpression(child1)) {
                var targetid = child1.getChildAt(1, sourceFile);
                if (ts.isIdentifier(targetid)) {
                    findClassID = targetid;
                }
            }
            else {
                var findReturnId = node.getChildren().find(function (c) { return c.kind === ts.SyntaxKind.Identifier; });
                if (findReturnId) {
                    findClassID = getInstanceClass(findReturnId.getText(sourceFile), sourceFile, program);
                }
            }
        }
        if (findClassID) {
            return;
        }
        ts.forEachChild(node, visit);
    }
    return findClassID;
}
function getCallExpressionGraphIDs(node, sourceFile, program, depth) {
    var _a, _b, _c, _d, _e, _f, _g;
    var child1 = node.getChildAt(0, sourceFile);
    var checker = program.getTypeChecker();
    var callNode;
    var parentCallNodeString;
    // 这一段的多样性会非常多
    if (child1.kind === ts.SyntaxKind.PropertyAccessExpression) {
        var firstNode = child1.getChildAt(0, sourceFile);
        var thNode = child1.getChildAt(2, sourceFile);
        if (ts.isIdentifier(firstNode)) {
            parentCallNodeString = firstNode.getText(sourceFile);
        }
        else if (ts.isCallExpression(firstNode)) {
            var type = checker.getTypeAtLocation(firstNode.getChildAt(0, sourceFile));
            var func2Signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
            if (func2Signature.getReturnType().aliasSymbol) {
                parentCallNodeString = checker.typeToString(func2Signature.getReturnType());
            }
            else {
                var dec = func2Signature.getDeclaration();
                if (ts.isArrowFunction(dec) || ts.isFunctionDeclaration(dec)) {
                    parentCallNodeString = (_a = getFunctionCallReturnClass(dec, sourceFile, program)) === null || _a === void 0 ? void 0 : _a.getText(sourceFile);
                }
            }
        }
        else if (ts.isPropertyAccessExpression(firstNode)) {
            var checker_1 = program.getTypeChecker();
            var type = checker_1.getTypeAtLocation(firstNode.expression);
            var dec = type.getSymbol().valueDeclaration;
            if (ts.isClassDeclaration(dec)) {
                var memberName = firstNode.getChildAt(2, sourceFile).getText(sourceFile);
                var funcSymbol = type.getProperty(memberName);
                var fdec = funcSymbol === null || funcSymbol === void 0 ? void 0 : funcSymbol.valueDeclaration;
                if (fdec && ts.isPropertyDeclaration(fdec)) {
                    if (fdec.type) {
                        parentCallNodeString = (_b = fdec.type) === null || _b === void 0 ? void 0 : _b.getText(sourceFile);
                    }
                    else {
                        parentCallNodeString = (_c = getPropertyDeclarationReturnClass(fdec, sourceFile, program)) === null || _c === void 0 ? void 0 : _c.getText(sourceFile);
                    }
                }
            }
        }
        if (ts.isIdentifier(thNode)) {
            callNode = thNode;
        }
    }
    else if (child1.kind === ts.SyntaxKind.Identifier) {
        callNode = child1;
        // const child2 = node.getChildAt(1, sourceFile);
        // // 这里的限制可能会很大！
        // if (child2.kind === ts.SyntaxKind.OpenParenToken) {
        //   callNode = child1 as ts.Identifier;
        // }
    }
    if (callNode) {
        var type = program.getTypeChecker().getTypeAtLocation(callNode);
        if ((_d = type.getSymbol()) === null || _d === void 0 ? void 0 : _d.valueDeclaration) {
            if (((_f = (_e = type.getSymbol()) === null || _e === void 0 ? void 0 : _e.valueDeclaration) === null || _f === void 0 ? void 0 : _f.getSourceFile().fileName) !== sourceFile.fileName) {
                console.log(new Array(depth + 1).fill('\t') + "".concat(depth, "[getCallExpressionGraphIDs]: "), 'case 1');
                var callPaths = getClassCallPaths(program, callNode.getText(sourceFile), (_g = type.getSymbol()) === null || _g === void 0 ? void 0 : _g.valueDeclaration, []);
                // console.log(callPaths, 'callPaths1');
                return callPaths.map(function (data) { return (__assign(__assign({}, data), { fileName: (0, file_util_1.declarationFileName2FileName)(data.fileName) })); });
            }
        }
        else {
            var callSigns = program.getTypeChecker().getTypeAtLocation(callNode).getCallSignatures();
            if (callSigns.length && callSigns[0].declaration) {
                if (callSigns[0].declaration.getSourceFile().fileName !== sourceFile.fileName) {
                    console.log(new Array(depth + 1).fill('\t') + "".concat(depth, "[getCallExpressionGraphIDs]: "), 'case 2');
                    var callPaths = getClassCallPaths(program, callNode.getText(sourceFile), callSigns[0].declaration, []);
                    // console.log(callPaths, 'callPaths 2');
                    return callPaths.map(function (data) { return (__assign(__assign({}, data), { fileName: (0, file_util_1.declarationFileName2FileName)(data.fileName) })); });
                }
            }
        }
        if (callNode) {
            if (parentCallNodeString) {
                var instanceClass = getInstanceClass(parentCallNodeString, sourceFile, program);
                if (instanceClass) {
                    parentCallNodeString = instanceClass.getText(sourceFile);
                }
            }
            var importMap = (0, file_util_1.getImportMap)(sourceFile);
            var pathData = importMap.get(parentCallNodeString || callNode.getText(sourceFile));
            console.log(callNode.getText(sourceFile), pathData, 'pathData');
            if (pathData) {
                var absPath = (0, file_util_1.getResolvedPath)(sourceFile.fileName, pathData.path);
                var otherSourceFile = program.getSourceFile(absPath);
                var otherNode = getNodeBySymbol(parentCallNodeString || callNode.getText(sourceFile), otherSourceFile);
                if (otherSourceFile && otherNode) {
                    var callPaths = getClassCallPaths(program, callNode.getText(sourceFile), otherNode, []);
                    console.log(new Array(depth + 1).fill('\t') + "".concat(depth, "[getCallExpressionGraphIDs]: "), 'case 自定义解析');
                    return callPaths.map(function (data) { return (__assign(__assign({}, data), { parentCallSymbol: parentCallNodeString, fileName: (0, file_util_1.declarationFileName2FileName)(data.fileName) })); });
                }
            }
            else {
                var findInCurrentFile = getFunctionDeclarationBySymbol(callNode.getText(sourceFile), sourceFile);
                console.log(findInCurrentFile, 'findInCurrentFile');
                if (findInCurrentFile) {
                    return [
                        {
                            nodeSymbol: callNode.getText(sourceFile),
                            fileName: sourceFile.fileName,
                        },
                    ];
                }
            }
        }
    }
    return [];
}
exports.getCallExpressionGraphIDs = getCallExpressionGraphIDs;
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
exports.getNodeBySymbol = getNodeBySymbol;
function getFunctionDeclarationBySymbol(symbol, sourceFile) {
    var findNode;
    var visit = function (fnode) {
        var _a, _b;
        if (findNode)
            return;
        if (ts.isFunctionDeclaration(fnode)) {
            if (((_a = fnode.name) === null || _a === void 0 ? void 0 : _a.getText(sourceFile)) === symbol) {
                findNode = fnode;
            }
        }
        else if (ts.isVariableDeclaration(fnode)) {
            var findArrowFunction = fnode.getChildren().find(function (c) { return ts.isArrowFunction(c); });
            if (findArrowFunction && ((_b = fnode.name) === null || _b === void 0 ? void 0 : _b.getText(sourceFile)) === symbol) {
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
exports.getFunctionDeclarationBySymbol = getFunctionDeclarationBySymbol;
