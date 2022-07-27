import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as Graph from 'graphology';
import { ConnectNodeTypeEnum, GraphID, GraphNode, GraphUtil, TrackerGraph } from './graph';
import { getXkoolProgram, getXkoolProgramAllValidSourceFiles } from './xkoolpackage';
import { getCallExpressionGraphIDs } from './node.util';
import { getImportMap, getResolvedPath } from './file.util';

function searchCommentNextNodes(
  comment: string,
  sourceFile: ts.SourceFile,
): { node: ts.Node; comment: string }[] {
  const nodes: { node: ts.Node; comment: string }[] = [];
  ts.forEachChild(sourceFile, visit);
  function visit(node: ts.Node) {
    let isFind = false;
    const commentRanges = ts.getLeadingCommentRanges(sourceFile.getFullText(), node.getFullStart());
    if (commentRanges?.length) {
      const commentStrings: string[] = commentRanges.map((r) =>
        sourceFile.getFullText().slice(r.pos, r.end),
      );
      const findCS = commentStrings.find((string) => string.includes(comment));
      if (findCS) {
        nodes.push({ node, comment: findCS });
        isFind = true;
      }
    }
    if (!isFind) {
      ts.forEachChild(node, visit);
    }
  }
  return nodes;
}

function makeNodeGraph(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  program: ts.Program,
  sourceNode: GraphNode,
  graph: TrackerGraph,
  trackedGid: GraphID[],
  depth: number,
): GraphID[] {
  console.log(
    new Array(depth).fill('\t') + 'makeNodeGraph start',
    depth,
    node.getText(sourceFile).slice(0, 24),
  );
  if (node.getText(sourceFile).includes('(data, datai) => {')) {
  }
  const disableCallIDs = ['useEffect', 'useCallback', 'useRef'];
  let graphIDs: GraphID[] = [];
  ts.forEachChild(node, visit);
  function visit(node: ts.Node, lastCallID?: string) {
    // 被函数体包裹的不递归(注意外界递归传递的时候传递ArrFunctionChild即可)
    if (!disableCallIDs.find((did) => did === lastCallID)) {
      if (
        node.kind === ts.SyntaxKind.ArrowFunction ||
        node.kind === ts.SyntaxKind.FunctionDeclaration
      ) {
        return;
      }
    }

    let nextLastCallID: string = '';
    if (ts.isCallExpression(node)) {
      const callID = node.getChildAt(0, sourceFile).getText(sourceFile);
      if (!disableCallIDs.find((did) => did === callID)) {
        console.log(
          new Array(depth + 1).fill('\t') +
            `${depth}[makeNodeGraph currenNode]: ` +
            node.getText(sourceFile).slice(0, 30),
        );

        const child1 = node.getChildAt(0, sourceFile);
        const child2 = node.getChildAt(2, sourceFile);

        if (ts.isPropertyAccessExpression(child1) && child2?.kind === ts.SyntaxKind.SyntaxList) {
          const child2child = child2.getChildAt(0, sourceFile);
          if (child2child && ts.isArrowFunction(child2child)) {
            console.log(new Array(depth + 1).fill('\t') + '符合forEach等调用特征');

            const nextGraphIDs = makeNodeGraph(
              child2child.body,
              sourceFile,
              program,
              sourceNode,
              graph,
              trackedGid,
              depth + 1,
            );
            graphIDs.push(...nextGraphIDs);

            return;
          }
        }

        const callGraphIDs = getCallExpressionGraphIDs(node, sourceFile, program, depth + 1);
        console.log(
          new Array(depth + 1).fill('\t') +
            `${depth}[makeNodeGraph getCallExpressionGraphIDs Result]: `,
          callGraphIDs,
        );
        graphIDs.push(...callGraphIDs);

        callGraphIDs.forEach((gid) => {
          if (sourceNode.startNode) {
            graph.mergeNode(sourceNode.startNode.commentString);
            graph.mergeNode(GraphUtil.graphID2ID(gid));
            graph.mergeEdge(sourceNode.startNode.commentString, GraphUtil.graphID2ID(gid), {
              type: ConnectNodeTypeEnum.startNode,
            });
          } else if (sourceNode.outerVarDeclaration) {
            graph.mergeNode(GraphUtil.graphID2ID(sourceNode.outerVarDeclaration));
            graph.mergeNode(GraphUtil.graphID2ID(gid));
            graph.addEdge(
              GraphUtil.graphID2ID(sourceNode.outerVarDeclaration),
              GraphUtil.graphID2ID(gid),
              {
                type: ConnectNodeTypeEnum.outerVarRead,
              },
            );
          } else if (sourceNode.functionCallDeclaration) {
            graph.mergeNode(GraphUtil.graphID2ID(sourceNode.functionCallDeclaration));
            graph.mergeNode(GraphUtil.graphID2ID(gid));
            graph.mergeEdge(
              GraphUtil.graphID2ID(sourceNode.functionCallDeclaration),
              GraphUtil.graphID2ID(gid),
              {
                type: ConnectNodeTypeEnum.functionCall,
              },
            );
            console.log(
              new Array(depth + 1).fill('\t') + 'graph edge create!',
              sourceNode.functionCallDeclaration.nodeSymbol,
              gid.nodeSymbol,
            );
          } else if (sourceNode.eventSubscribeDeclaration) {
            graph.addNode(GraphUtil.graphID2ID(sourceNode.eventSubscribeDeclaration));
            graph.addNode(GraphUtil.graphID2ID(gid));
            graph.mergeEdge(
              GraphUtil.graphID2ID(sourceNode.eventSubscribeDeclaration),
              GraphUtil.graphID2ID(gid),
              {
                type: ConnectNodeTypeEnum.eventSubscribe,
              },
            );
          }
          if (!trackedGid.find((tgid) => tgid === gid)) {
            trackedGid.push(gid);

            const importMap = getImportMap(sourceFile);
            const isImportDefault = importMap.get(gid.nodeSymbol)?.isDefaultImport;

            const xkoolProgram = getXkoolProgram();
            trackGraphID(
              gid,
              graph,
              trackedGid,
              depth + 1,
              !!xkoolProgram.getSourceFile(gid.fileName) ? xkoolProgram : program,
              isImportDefault,
            );
          }
        });
        // 不递归这里
        return;
      } else {
        nextLastCallID = callID;
      }
    }
    ts.forEachChild(node, (n) => visit(n, nextLastCallID));
  }
  console.log(new Array(depth).fill('\t') + 'makeNodeGraph end:', graphIDs);
  return graphIDs;
}

const TrackGraphCacheMap: Map<string, GraphID[]> = new Map();

function trackGraphID(
  gid: GraphID,
  graph: TrackerGraph,
  trackedGid: GraphID[],
  depth: number,
  program: ts.Program,
  isImportDefault: boolean = false,
): GraphID[] {
  if (TrackGraphCacheMap.has(GraphUtil.graphID2ID(gid))) {
    return TrackGraphCacheMap.get(GraphUtil.graphID2ID(gid))!;
  }

  console.log(
    new Array(depth).fill('\t') + `${depth}[trackGraphID start]`,
    gid.nodeSymbol,
    gid.parentCallSymbol,
  );
  const sourceFile = program.getSourceFile(gid.fileName);
  let graphIDs: GraphID[] = [];
  let targetNode: ts.Node | undefined;
  let targetNodeType: ConnectNodeTypeEnum | undefined;
  ts.forEachChild(sourceFile, visit);

  function visit(node: ts.Node, parentNode?: ts.Node) {
    if (parentNode) {
      (node as any)._myparent = parentNode;
    }

    if (isImportDefault) {
      if (ts.isExportAssignment(node)) {
        if (node.getChildAt(1, sourceFile)?.kind === ts.SyntaxKind.DefaultKeyword) {
          const nchild = node.getChildAt(2, sourceFile);
          if (nchild && ts.isArrowFunction(nchild)) {
            targetNode = nchild;
            targetNodeType = ConnectNodeTypeEnum.functionCall;
            return;
          }
        }
      }
      if (ts.isFunctionDeclaration(node)) {
        const nchild = node.getChildAt(0, sourceFile);
        if (nchild?.kind === ts.SyntaxKind.SyntaxList) {
          const nchildc1 = nchild.getChildAt(0, sourceFile);
          const nchildc2 = nchild.getChildAt(1, sourceFile);
          if (
            nchildc1?.kind === ts.SyntaxKind.ExportKeyword &&
            nchildc2?.kind === ts.SyntaxKind.DefaultKeyword
          ) {
            if (node.body) {
              targetNode = node.body;
              targetNodeType = ConnectNodeTypeEnum.functionCall;
              return;
            }
          }
        }
      }
    }

    if (ts.isIdentifier(node) && node.getText(sourceFile) === gid.nodeSymbol) {
      let parent = parentNode;
      while (parent && !targetNode) {
        let findIDNode: ts.Identifier | undefined;
        // TODO: 增加类型判断
        if (gid.parentCallSymbol) {
          if (ts.isClassDeclaration(parent)) {
            parent.forEachChild((pchild) => {
              if (ts.isIdentifier(pchild) && pchild.getText(sourceFile) === gid.parentCallSymbol) {
                findIDNode = pchild;
              }
            });
          } else if (ts.isIdentifier(parent)) {
            if (parent.getText(sourceFile) === gid.parentCallSymbol) {
              findIDNode = parent;
            }
          }
        } else if (ts.isFunctionDeclaration(parent)) {
          targetNode = parent;
          targetNodeType = ConnectNodeTypeEnum.functionCall;
          break;
        } else if (ts.isVariableDeclaration(parent)) {
          const afchild = parent.getChildren().find((pc) => ts.isArrowFunction(pc));
          if (afchild) {
            targetNode = afchild;
            targetNodeType = ConnectNodeTypeEnum.functionCall;
            break;
          }
        }

        if (findIDNode) {
          targetNode = (node as any)._myparent;
          targetNodeType = ConnectNodeTypeEnum.functionCall;
          break;
        }
        parent = (parent as any)._myparent;
      }
    }

    if (targetNode) {
      return;
    }
    ts.forEachChild(node, (n) => visit(n, node));
  }
  if (targetNode) {
    switch (targetNodeType) {
      default: {
        break;
      }
      case ConnectNodeTypeEnum.functionCall: {
        makeNodeGraph(
          targetNode,
          sourceFile,
          program,
          {
            functionCallDeclaration: gid,
          },
          graph,
          trackedGid,
          depth + 1,
        );
        break;
      }
      case ConnectNodeTypeEnum.outerVarRead: {
        makeNodeGraph(
          targetNode,
          sourceFile,
          program,
          {
            outerVarDeclaration: gid,
          },
          graph,
          trackedGid,
          depth + 1,
        );
        break;
      }
      case ConnectNodeTypeEnum.eventSubscribe: {
        makeNodeGraph(
          targetNode,
          sourceFile,
          program,
          {
            eventSubscribeDeclaration: gid,
          },
          graph,
          trackedGid,
          depth + 1,
        );
        break;
      }
    }
  }

  console.log(new Array(depth).fill('\t') + `${depth}[trackGraphID end]`, graphIDs);
  TrackGraphCacheMap.set(GraphUtil.graphID2ID(gid), graphIDs);
  return graphIDs;
}

function excute({ rootNames }: { rootNames: string[] }) {
  const program = ts.createProgram({ rootNames, options: {} });
  const importedRelatedFiles: Set<string> = new Set();
  rootNames.forEach((rootName) => {
    const sourceFile = program.getSourceFile(rootName);
    const importMap = getImportMap(sourceFile);
    importMap.forEach((value) => {
      if (!value.isAsType && value.isReletivePath) {
        importedRelatedFiles.add(getResolvedPath(rootName, value.path));
      }
    });
  });

  console.log(importedRelatedFiles, 'importedRelatedFiles');
  const importProgram = ts.createProgram({
    rootNames: [...rootNames, ...Array.from(importedRelatedFiles)],
    options: {
      declaration: true,
      declarationMap: true,
    },
  });

  const graph = new (Graph as any).Graph() as TrackerGraph;
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

  rootNames.forEach((rootName) => {
    const sourceFile = importProgram.getSourceFile(rootName);
    const nodes = searchCommentNextNodes('#CA.Track.Entry:', sourceFile);

    nodes.forEach(({ node, comment }) => {
      // 主动调用的graphID
      makeNodeGraph(
        node,
        sourceFile,
        importProgram,
        {
          startNode: {
            // 这个可能是代码块
            id: {
              nodeSymbol: comment,
              fileName: sourceFile.fileName,
            },
            commentString: comment,
          },
        },
        graph,
        [],
        0,
      );
    });
  });
  console.log(
    graph.nodes().map((n) => n),
    'graph nodes',
  );
  console.log(
    graph.mapEdges((e, a, source, target) => [source, target]),
    'graph mapEdges',
  );
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
