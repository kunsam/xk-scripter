import Graph from 'graphology';

export interface GraphID {
  nodeSymbol: string;
  isDefaultExport?: boolean;
  // 调用node的代码callExpressionSymbol
  parentCallSymbol?: string;
  fileName: string;
}

interface GraphStartNode {
  id: GraphID;
  // 可能还要加个索引
  commentString: string;
}

export enum ConnectNodeTypeEnum {
  startNode = 'startNode',
  outerVarRead = 'outerVarRead',
  functionCall = 'functionCall',
  eventSubscribe = 'eventSubscribe',
}

// 必是其中一种
export interface GraphNode {
  startNode?: GraphStartNode;
  outerVarDeclaration?: GraphID;
  functionCallDeclaration?: GraphID;
  eventSubscribeDeclaration?: GraphID;
}

export interface GraphEdge {
  type: ConnectNodeTypeEnum;
}

export type TrackerGraph = Graph<GraphNode, GraphEdge>;

export class GraphUtil {
  public static graphID2ID(gid: GraphID) {
    let str = `${gid.fileName}`;
    if (gid.parentCallSymbol) {
      str += `#${gid.parentCallSymbol}`;
    }
    str += `#${gid.nodeSymbol}`;
    return str;
  }

  public static iD2GraphID(id: string): GraphID {
    const strs = id.split('#');
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
  }
}
