"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphUtil = exports.ConnectNodeTypeEnum = void 0;
var ConnectNodeTypeEnum;
(function (ConnectNodeTypeEnum) {
    ConnectNodeTypeEnum["startNode"] = "startNode";
    ConnectNodeTypeEnum["outerVarRead"] = "outerVarRead";
    ConnectNodeTypeEnum["functionCall"] = "functionCall";
    ConnectNodeTypeEnum["eventSubscribe"] = "eventSubscribe";
})(ConnectNodeTypeEnum = exports.ConnectNodeTypeEnum || (exports.ConnectNodeTypeEnum = {}));
var GraphUtil = /** @class */ (function () {
    function GraphUtil() {
    }
    GraphUtil.graphID2ID = function (gid) {
        var str = "".concat(gid.fileName);
        if (gid.parentCallSymbol) {
            str += "#".concat(gid.parentCallSymbol);
        }
        str += "#".concat(gid.nodeSymbol);
        return str;
    };
    GraphUtil.iD2GraphID = function (id) {
        var strs = id.split('#');
        if (strs.length === 2) {
            return {
                fileName: strs[0],
                nodeSymbol: strs[1],
            };
        }
        if (strs.length === 3) {
            throw new Error('iD2GraphID Error');
        }
        return {
            fileName: strs[0],
            nodeSymbol: strs[1],
            parentCallSymbol: strs[2],
        };
    };
    return GraphUtil;
}());
exports.GraphUtil = GraphUtil;
