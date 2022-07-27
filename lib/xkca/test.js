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
var path = require("path");
var Graph = require("graphology");
var graph_1 = require("./graph");
var xkoolpackage_1 = require("./xkoolpackage");
var node_util_1 = require("./node.util");
var file_util_1 = require("./file.util");
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
            var findCS = commentStrings.find(function (string) { return string.includes(comment); });
            if (findCS) {
                nodes.push({ node: node, comment: findCS });
                isFind = true;
            }
        }
        if (!isFind) {
            ts.forEachChild(node, visit);
        }
    }
    return nodes;
}
function makeNodeGraph(node, sourceFile, program, sourceNode, graph, trackedGid, depth) {
    console.log(new Array(depth).fill('\t') + 'makeNodeGraph start', depth, node.getText(sourceFile).slice(0, 24));
    if (node.getText(sourceFile).includes('(data, datai) => {')) {
    }
    var disableCallIDs = ['useEffect', 'useCallback', 'useRef'];
    var graphIDs = [];
    ts.forEachChild(node, visit);
    function visit(node, lastCallID) {
        // 被函数体包裹的不递归(注意外界递归传递的时候传递ArrFunctionChild即可)
        if (!disableCallIDs.find(function (did) { return did === lastCallID; })) {
            if (node.kind === ts.SyntaxKind.ArrowFunction ||
                node.kind === ts.SyntaxKind.FunctionDeclaration) {
                return;
            }
        }
        var nextLastCallID = '';
        if (ts.isCallExpression(node)) {
            var callID_1 = node.getChildAt(0, sourceFile).getText(sourceFile);
            if (!disableCallIDs.find(function (did) { return did === callID_1; })) {
                console.log(new Array(depth + 1).fill('\t') +
                    "".concat(depth, "[makeNodeGraph currenNode]: ") +
                    node.getText(sourceFile).slice(0, 30));
                var child1 = node.getChildAt(0, sourceFile);
                var child2 = node.getChildAt(2, sourceFile);
                if (ts.isPropertyAccessExpression(child1) && (child2 === null || child2 === void 0 ? void 0 : child2.kind) === ts.SyntaxKind.SyntaxList) {
                    var child2child = child2.getChildAt(0, sourceFile);
                    if (child2child && ts.isArrowFunction(child2child)) {
                        console.log(new Array(depth + 1).fill('\t') + '符合forEach等调用特征');
                        var nextGraphIDs = makeNodeGraph(child2child.body, sourceFile, program, sourceNode, graph, trackedGid, depth + 1);
                        graphIDs.push.apply(graphIDs, nextGraphIDs);
                        return;
                    }
                }
                var callGraphIDs = (0, node_util_1.getCallExpressionGraphIDs)(node, sourceFile, program, depth + 1);
                console.log(new Array(depth + 1).fill('\t') +
                    "".concat(depth, "[makeNodeGraph getCallExpressionGraphIDs Result]: "), callGraphIDs);
                graphIDs.push.apply(graphIDs, callGraphIDs);
                callGraphIDs.forEach(function (gid) {
                    var _a;
                    if (sourceNode.startNode) {
                        graph.mergeNode(sourceNode.startNode.commentString);
                        graph.mergeNode(graph_1.GraphUtil.graphID2ID(gid));
                        graph.mergeEdge(sourceNode.startNode.commentString, graph_1.GraphUtil.graphID2ID(gid), {
                            type: graph_1.ConnectNodeTypeEnum.startNode,
                        });
                    }
                    else if (sourceNode.outerVarDeclaration) {
                        graph.mergeNode(graph_1.GraphUtil.graphID2ID(sourceNode.outerVarDeclaration));
                        graph.mergeNode(graph_1.GraphUtil.graphID2ID(gid));
                        graph.addEdge(graph_1.GraphUtil.graphID2ID(sourceNode.outerVarDeclaration), graph_1.GraphUtil.graphID2ID(gid), {
                            type: graph_1.ConnectNodeTypeEnum.outerVarRead,
                        });
                    }
                    else if (sourceNode.functionCallDeclaration) {
                        graph.mergeNode(graph_1.GraphUtil.graphID2ID(sourceNode.functionCallDeclaration));
                        graph.mergeNode(graph_1.GraphUtil.graphID2ID(gid));
                        graph.mergeEdge(graph_1.GraphUtil.graphID2ID(sourceNode.functionCallDeclaration), graph_1.GraphUtil.graphID2ID(gid), {
                            type: graph_1.ConnectNodeTypeEnum.functionCall,
                        });
                        console.log(new Array(depth + 1).fill('\t') + 'graph edge create!', sourceNode.functionCallDeclaration.nodeSymbol, gid.nodeSymbol);
                    }
                    else if (sourceNode.eventSubscribeDeclaration) {
                        graph.addNode(graph_1.GraphUtil.graphID2ID(sourceNode.eventSubscribeDeclaration));
                        graph.addNode(graph_1.GraphUtil.graphID2ID(gid));
                        graph.mergeEdge(graph_1.GraphUtil.graphID2ID(sourceNode.eventSubscribeDeclaration), graph_1.GraphUtil.graphID2ID(gid), {
                            type: graph_1.ConnectNodeTypeEnum.eventSubscribe,
                        });
                    }
                    if (!trackedGid.find(function (tgid) { return tgid === gid; })) {
                        trackedGid.push(gid);
                        var importMap = (0, file_util_1.getImportMap)(sourceFile);
                        var isImportDefault = (_a = importMap.get(gid.nodeSymbol)) === null || _a === void 0 ? void 0 : _a.isDefaultImport;
                        var xkoolProgram = (0, xkoolpackage_1.getXkoolProgram)();
                        trackGraphID(gid, graph, trackedGid, depth + 1, !!xkoolProgram.getSourceFile(gid.fileName) ? xkoolProgram : program, isImportDefault);
                    }
                });
                // 不递归这里
                return;
            }
            else {
                nextLastCallID = callID_1;
            }
        }
        ts.forEachChild(node, function (n) { return visit(n, nextLastCallID); });
    }
    console.log(new Array(depth).fill('\t') + 'makeNodeGraph end:', graphIDs);
    return graphIDs;
}
var TrackGraphCacheMap = new Map();
function trackGraphID(gid, graph, trackedGid, depth, program, isImportDefault) {
    if (isImportDefault === void 0) { isImportDefault = false; }
    if (TrackGraphCacheMap.has(graph_1.GraphUtil.graphID2ID(gid))) {
        return TrackGraphCacheMap.get(graph_1.GraphUtil.graphID2ID(gid));
    }
    console.log(new Array(depth).fill('\t') + "".concat(depth, "[trackGraphID start]"), gid.nodeSymbol, gid.parentCallSymbol);
    var sourceFile = program.getSourceFile(gid.fileName);
    var graphIDs = [];
    var targetNode;
    var targetNodeType;
    ts.forEachChild(sourceFile, visit);
    function visit(node, parentNode) {
        var _a;
        if (parentNode) {
            node._myparent = parentNode;
        }
        if (isImportDefault) {
            if (ts.isExportAssignment(node)) {
                if (((_a = node.getChildAt(1, sourceFile)) === null || _a === void 0 ? void 0 : _a.kind) === ts.SyntaxKind.DefaultKeyword) {
                    var nchild = node.getChildAt(2, sourceFile);
                    if (nchild && ts.isArrowFunction(nchild)) {
                        targetNode = nchild;
                        targetNodeType = graph_1.ConnectNodeTypeEnum.functionCall;
                        return;
                    }
                }
            }
            if (ts.isFunctionDeclaration(node)) {
                var nchild = node.getChildAt(0, sourceFile);
                if ((nchild === null || nchild === void 0 ? void 0 : nchild.kind) === ts.SyntaxKind.SyntaxList) {
                    var nchildc1 = nchild.getChildAt(0, sourceFile);
                    var nchildc2 = nchild.getChildAt(1, sourceFile);
                    if ((nchildc1 === null || nchildc1 === void 0 ? void 0 : nchildc1.kind) === ts.SyntaxKind.ExportKeyword &&
                        (nchildc2 === null || nchildc2 === void 0 ? void 0 : nchildc2.kind) === ts.SyntaxKind.DefaultKeyword) {
                        if (node.body) {
                            targetNode = node.body;
                            targetNodeType = graph_1.ConnectNodeTypeEnum.functionCall;
                            return;
                        }
                    }
                }
            }
        }
        if (ts.isIdentifier(node) && node.getText(sourceFile) === gid.nodeSymbol) {
            var parent_1 = parentNode;
            var _loop_1 = function () {
                var findIDNode;
                // TODO: 增加类型判断
                if (gid.parentCallSymbol) {
                    if (ts.isClassDeclaration(parent_1)) {
                        parent_1.forEachChild(function (pchild) {
                            if (ts.isIdentifier(pchild) && pchild.getText(sourceFile) === gid.parentCallSymbol) {
                                findIDNode = pchild;
                            }
                        });
                    }
                    else if (ts.isIdentifier(parent_1)) {
                        if (parent_1.getText(sourceFile) === gid.parentCallSymbol) {
                            findIDNode = parent_1;
                        }
                    }
                }
                else if (ts.isFunctionDeclaration(parent_1)) {
                    targetNode = parent_1;
                    targetNodeType = graph_1.ConnectNodeTypeEnum.functionCall;
                    return "break";
                }
                else if (ts.isVariableDeclaration(parent_1)) {
                    var afchild = parent_1.getChildren().find(function (pc) { return ts.isArrowFunction(pc); });
                    if (afchild) {
                        targetNode = afchild;
                        targetNodeType = graph_1.ConnectNodeTypeEnum.functionCall;
                        return "break";
                    }
                }
                if (findIDNode) {
                    targetNode = node._myparent;
                    targetNodeType = graph_1.ConnectNodeTypeEnum.functionCall;
                    return "break";
                }
                parent_1 = parent_1._myparent;
            };
            while (parent_1 && !targetNode) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
        }
        if (targetNode) {
            return;
        }
        ts.forEachChild(node, function (n) { return visit(n, node); });
    }
    if (targetNode) {
        switch (targetNodeType) {
            default: {
                break;
            }
            case graph_1.ConnectNodeTypeEnum.functionCall: {
                makeNodeGraph(targetNode, sourceFile, program, {
                    functionCallDeclaration: gid,
                }, graph, trackedGid, depth + 1);
                break;
            }
            case graph_1.ConnectNodeTypeEnum.outerVarRead: {
                makeNodeGraph(targetNode, sourceFile, program, {
                    outerVarDeclaration: gid,
                }, graph, trackedGid, depth + 1);
                break;
            }
            case graph_1.ConnectNodeTypeEnum.eventSubscribe: {
                makeNodeGraph(targetNode, sourceFile, program, {
                    eventSubscribeDeclaration: gid,
                }, graph, trackedGid, depth + 1);
                break;
            }
        }
    }
    console.log(new Array(depth).fill('\t') + "".concat(depth, "[trackGraphID end]"), graphIDs);
    TrackGraphCacheMap.set(graph_1.GraphUtil.graphID2ID(gid), graphIDs);
    return graphIDs;
}
function excute(_a) {
    var rootNames = _a.rootNames;
    var program = ts.createProgram({ rootNames: rootNames, options: {} });
    var importedRelatedFiles = new Set();
    rootNames.forEach(function (rootName) {
        var sourceFile = program.getSourceFile(rootName);
        var importMap = (0, file_util_1.getImportMap)(sourceFile);
        importMap.forEach(function (value) {
            if (!value.isAsType && value.isReletivePath) {
                importedRelatedFiles.add((0, file_util_1.getResolvedPath)(rootName, value.path));
            }
        });
    });
    console.log(importedRelatedFiles, 'importedRelatedFiles');
    var importProgram = ts.createProgram({
        rootNames: __spreadArray(__spreadArray([], rootNames, true), Array.from(importedRelatedFiles), true),
        options: {
            declaration: true,
            declarationMap: true,
        },
    });
    var graph = new Graph.Graph();
    // const xkoolProgram = getXkoolProgram();
    // const allSourceFiles = getXkoolProgramAllValidSourceFiles();
    // console.log(allSourceFiles.length, 'allSourceFiles');
    // console.time('allSourceFiles');
    // const allGraphIDS: GraphID[] = []
    // allSourceFiles.forEach((sf) => {
    //   const graphIDs = getNodeGraphIDs(sf, sf, xkoolProgram);
    //   allGraphIDS.push(...graphIDs)
    // });
    // console.timeEnd('allSourceFiles');
    rootNames.forEach(function (rootName) {
        var sourceFile = importProgram.getSourceFile(rootName);
        var nodes = searchCommentNextNodes('#CA.Track.Entry:', sourceFile);
        nodes.forEach(function (_a) {
            var node = _a.node, comment = _a.comment;
            // 主动调用的graphID
            makeNodeGraph(node, sourceFile, importProgram, {
                startNode: {
                    // 这个可能是代码块
                    id: {
                        nodeSymbol: comment,
                        fileName: sourceFile.fileName,
                    },
                    commentString: comment,
                },
            }, graph, [], 0);
        });
    });
    console.log(graph.nodes().map(function (n) { return n; }), 'graph nodes');
    console.log(graph.mapEdges(function (e, a, source, target) { return [source, target]; }), 'graph mapEdges');
}
excute({
    rootNames: [path.join(__dirname, '../../../dt-web/src/hooks/walls/useAddWall.ts')],
});
// excute({
//   rootNames: [
//     path.join(
//       __dirname,
//       '../../../dt-web/src/features/buildingSystem/components/StandardFloorObject.tsx',
//     ),
//   ],
// });
