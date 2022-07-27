"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolvedPath = exports.getImportMap = exports.declarationFileName2FileName = void 0;
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
// TODO: 可能还需要完善
function declarationFileName2FileName(dfilename) {
    return dfilename.replace(/dist/, 'src').replace(/\.d\.ts$/, '.ts');
}
exports.declarationFileName2FileName = declarationFileName2FileName;
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
                var firstChild = cnode.getChildAt(0, sourceFile);
                var isAsType_1 = firstChild.kind === ts.SyntaxKind.TypeKeyword;
                var isReletivePath_1 = path.startsWith("'@/") || path.startsWith("'./") || path.startsWith("'../");
                var ccnode = cnode.getChildren().find(function (n) { return n.kind === ts.SyntaxKind.NamedImports; });
                if (ts.isIdentifier(firstChild) && !ccnode) {
                    map.set(firstChild.getText(sourceFile), {
                        path: path,
                        isAsType: isAsType_1,
                        isReletivePath: isReletivePath_1,
                        isPackage: !isReletivePath_1,
                        isDefaultImport: true,
                    });
                    return;
                }
                if (ccnode) {
                    ccnode.forEachChild(function (cccnode) {
                        cccnode.forEachChild(function (ccccnode) {
                            if (ccccnode.kind === ts.SyntaxKind.Identifier) {
                                map.set(ccccnode.getText(sourceFile), {
                                    path: path,
                                    isAsType: isAsType_1,
                                    isReletivePath: isReletivePath_1,
                                    isPackage: !isReletivePath_1,
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
exports.getImportMap = getImportMap;
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
function getResolvedPath(currentFileName, relativePath) {
    var purePath = relativePath.replace(/\'/g, '');
    if (purePath.startsWith('@/')) {
        var prefixPath = currentFileName.match(/^(.)+frontend_prime\/packages\/.+?\//)[0];
        var filename = getWithExtFilename(path.join(prefixPath, 'src', purePath.replace(/\@\//g, '')));
        return filename;
    }
    if (purePath.startsWith('./')) {
        purePath = purePath.replace(/^\.\//, '');
        var currentFileNameWithoutLast = currentFileName.split('/');
        currentFileNameWithoutLast.pop();
        return getWithExtFilename(path.join(currentFileNameWithoutLast.join('/'), purePath));
    }
    return getWithExtFilename(path.join(currentFileName, purePath));
}
exports.getResolvedPath = getResolvedPath;
// const apath = '/frontend_prime/packages/dt-web/src/hooks/walls/useAddWall.ts';
// const atestpath1 = './testAddWall';
// const atestpath2 = './../../dtWebApp/dtWebApp';
// const atestpath3 = '../../dtWebApp/dtWebApp';
// const result1 = path.join(apath, atestpath1);
// const result2 = path.join(apath, atestpath2);
// const result3 = path.join(apath, atestpath3);
// console.log('result1', result1);
// console.log('result2', result2);
// console.log('result3', result3);
