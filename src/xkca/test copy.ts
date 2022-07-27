import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import Graph from 'graphology';

interface ImportData {
  path: string;
  isPackage: boolean;
  isReletivePath: boolean;
  isAsType: boolean;
}

interface CallFromData {
  callSymbol: string;
  parentClassSymbol?: string;
  originalFileName: string;
}

// export interface XKOOL_PACKAGE_MAP

const XKOOL_PACKAGE_MAP: Record<string, string> = {
  '@xkool/app-runner': path.join(__dirname, '../../../app-runner/src/index.ts'),
  '@xkool/core': path.join(__dirname, '../../../core/src/index.ts'),
  '@xkool/dt': path.join(__dirname, '../../../dt/src/index.ts'),
  '@xkool/dt3d': path.join(__dirname, '../../../dt3d/src/index.ts'),
  '@xkool/graphic': path.join(__dirname, '../../../graphic/src/index.ts'),
  '@xkool/icons': path.join(__dirname, '../../../icons/src/index.ts'),
  '@xkool/ui': path.join(__dirname, '../../../ui/src/index.ts'),
  '@xkool/utils': path.join(__dirname, '../../../utils/src/index.ts'),
};

const programMap: Map<string, ts.Program> = new Map();
function getProgramFromPackage(packageName: string): ts.Program | undefined {
  if (!XKOOL_PACKAGE_MAP[packageName]) {
    return;
  }
  if (!programMap.has(packageName)) {
    programMap.set(
      packageName,
      ts.createProgram({
        rootNames: [XKOOL_PACKAGE_MAP[packageName]],
        options: {},
      }),
    );
  }
  return programMap.get(packageName)!;
}

function getResolvedPath(currentFileName: string, relativePath: string): string {
  const purePath = relativePath.replace(/\'/g, '');
  if (purePath.startsWith('@/')) {
    const prefixPath = currentFileName.match(/^(.)+frontend_prime\/packages\/.+?\//)[0];
    const filename = getWithExtFilename(
      path.join(prefixPath, 'src', purePath.replace(/\@\//g, '')),
    );
    return filename;
  }
  return getWithExtFilename(path.join(currentFileName, purePath));
}

function getWithExtFilename(filename: string): string {
  if (fs.existsSync(filename)) return filename;
  if (fs.existsSync(`${filename}.ts`)) return `${filename}.ts`;
  if (fs.existsSync(`${filename}.tsx`)) return `${filename}.tsx`;
  if (fs.existsSync(`${filename}/index.ts`)) return `${filename}/index.ts`;
  if (fs.existsSync(`${filename}/index.tsx`)) return `${filename}/index.tsx`;
  return filename;
}

function getImportMap(sourceFile: ts.SourceFile): Map<string, ImportData> {
  const map: Map<string, ImportData> = new Map();

  ts.forEachChild(sourceFile, visit);
  function visit(node: ts.Node) {
    let path: string = '';

    if (node.kind === ts.SyntaxKind.ImportDeclaration) {
      const cnode = node.getChildAt(3, sourceFile);
      if (cnode.kind === ts.SyntaxKind.StringLiteral) {
        path = cnode.getText(sourceFile);
      }
    }

    if (path) {
      const cnode = node.getChildAt(1, sourceFile);
      if (cnode.kind === ts.SyntaxKind.ImportClause) {
        const isAsType = cnode.getChildAt(0, sourceFile).kind === ts.SyntaxKind.TypeKeyword;
        const ccnode = cnode.getChildren().find((n) => n.kind === ts.SyntaxKind.NamedImports);
        if (ccnode) {
          ccnode.forEachChild((cccnode) => {
            cccnode.forEachChild((ccccnode) => {
              if (ccccnode.kind === ts.SyntaxKind.Identifier) {
                const isReletivePath =
                  path.startsWith("'@/") || path.startsWith("'./") || path.startsWith("'../");
                map.set(ccccnode.getText(sourceFile), {
                  path,
                  isAsType,
                  isReletivePath,
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

function searchCommentNextNodes(comment: string, sourceFile: ts.SourceFile): ts.Node[] {
  const nodes: ts.Node[] = [];
  ts.forEachChild(sourceFile, visit);
  function visit(node: ts.Node) {
    let isFind = false;
    const commentRanges = ts.getLeadingCommentRanges(sourceFile.getFullText(), node.getFullStart());
    if (commentRanges?.length) {
      const commentStrings: string[] = commentRanges.map((r) =>
        sourceFile.getFullText().slice(r.pos, r.end),
      );
      if (commentStrings.find((string) => string.includes(comment))) {
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

function getFunctionName(node: ts.Node, sourceFile: ts.SourceFile) {
  let name: string = '';
  ts.forEachChild(node, (cnode) => {
    if (name) return;
    if (cnode.kind === ts.SyntaxKind.VariableDeclarationList) {
      ts.forEachChild(cnode, (cnode2) => {
        if (cnode2.kind === ts.SyntaxKind.VariableDeclaration) {
          ts.forEachChild(cnode2, (cnode3) => {
            if (name) return;
            if (cnode3.kind === ts.SyntaxKind.Identifier) {
              name = cnode3.getFullText(sourceFile);
            }
          });
        }
      });
    }
    if (name) return;
    if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
      if (cnode.kind === ts.SyntaxKind.Identifier) {
        name = cnode.getFullText(sourceFile);
      }
    }
  });
  return name;
}

function getNodeBySymbol(symbol: string, sourceFile: ts.SourceFile): ts.Node | undefined {
  let findNode: ts.Node | undefined;
  const visit = (fnode: ts.Node) => {
    if (findNode) return;
    if (fnode.kind === ts.SyntaxKind.Identifier) {
      if (fnode.getText(sourceFile) === symbol) {
        findNode = fnode as ts.FunctionDeclaration;
      }
    }
    if (findNode) return;
    ts.forEachChild(fnode, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return findNode;
}

function getFunctionDeclaration(functionSymbol: string, sourceFile: ts.SourceFile) {
  let findFunctionDeclaration: ts.FunctionDeclaration | undefined;
  const visitfindSourceFile = (fnode: ts.Node) => {
    if (findFunctionDeclaration) return;
    if (fnode.kind === ts.SyntaxKind.FunctionDeclaration) {
      let functionDeclarationID: string = '';
      fnode.forEachChild((ffnode) => {
        if (ffnode.kind === ts.SyntaxKind.Identifier) {
          functionDeclarationID = ffnode.getText(sourceFile);
        }
      });
      if (functionDeclarationID && functionDeclarationID === functionSymbol) {
        findFunctionDeclaration = fnode as ts.FunctionDeclaration;
      }
    }
    if (findFunctionDeclaration) return;
    ts.forEachChild(fnode, visitfindSourceFile);
  };
  ts.forEachChild(sourceFile, visitfindSourceFile);
  if (findFunctionDeclaration) {
    console.log('findFunctionDeclaration', findFunctionDeclaration);
  }
  return findFunctionDeclaration;
}

function getNodeAllVariableDeclarationMap(node: ts.Node, sourceFile: ts.SourceFile) {
  const nodeMap: Map<string, ts.VariableDeclaration> = new Map();
  ts.forEachChild(node, visit);
  function visit(cnode: ts.Node) {
    if (cnode.kind === ts.SyntaxKind.VariableDeclaration) {
      const child1 = cnode.getChildAt(0, sourceFile);
      nodeMap.set(child1.getText(sourceFile), cnode as ts.VariableDeclaration);
      return;
    }
    ts.forEachChild(cnode, visit);
  }
  return nodeMap;
}

function getPackageNameFromFileName(filename: string) {
  const strings = filename.match(/frontend_prime\/packages\/.+?\//);
  return `@xkool/${strings[0].replace(/frontend_prime\/packages\//, '').replace(/\/$/, '')}`;
}

function getCallNodeSourceFile(
  callNode: ts.Identifier,
  sourceFile: ts.SourceFile,
  program: ts.Program,
  importMap: Map<string, ImportData>,
): { sourceFile: ts.SourceFile; parentClassSymbol?: string } | undefined {
  const callNodeSymbolText = callNode.getText(sourceFile);

  const data = program.getTypeChecker().getTypeAtLocation(callNode);
  const symbol = data.getSymbol();
  if (!symbol) {
    const importData = importMap.get(callNodeSymbolText);

    if (importData && importData.isReletivePath) {
      const purePath = importData.path.replace(/\'/g, '');
      if (purePath.startsWith('@/')) {
        const prefixPath = sourceFile.fileName.match(/^(.)+frontend_prime\/packages\/.+?\//)[0];
        const filename = getWithExtFilename(
          path.join(prefixPath, 'src', purePath.replace(/\@\//g, '')),
        );
        const program2 = ts.createProgram({
          rootNames: [filename],
          options: {},
        });
        const data2 = program2.getTypeChecker().getTypeAtLocation(callNode);
        const symbol2 = data2.getSymbol();
        console.log('symbol2:', symbol2);
        return { sourceFile: program2.getSourceFile(filename) };
      }
    } else {
    }
    return undefined;
  }

  const fileName = symbol.valueDeclaration.getSourceFile().fileName;
  console.log(fileName, 'fileName');
  const packageProgram = getProgramFromPackage(getPackageNameFromFileName(fileName));
  if (packageProgram) {
    const findSourceFile = packageProgram
      .getSourceFiles()
      .filter((x) => !x.fileName.includes('node_modules'))
      .find((source) => source.getFullText(source).includes(callNodeSymbolText));
    if (findSourceFile) {
      const findNode = getNodeBySymbol(callNodeSymbolText, findSourceFile);
      if (findNode) {
        const findNodeType = packageProgram.getTypeChecker().getTypeAtLocation(findNode.parent);
        const targetSourceFile = findNodeType.getSymbol().valueDeclaration?.getSourceFile();
        let parentClassSymbol: string | undefined;
        if (
          findNodeType.getSymbol().valueDeclaration.parent.kind === ts.SyntaxKind.ClassDeclaration
        ) {
          parentClassSymbol = packageProgram
            .getTypeChecker()
            .getTypeAtLocation(findNodeType.getSymbol().valueDeclaration?.parent)
            ?.getSymbol()
            .escapedName.toString();
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

function getClassCallPaths(
  program: ts.Program,
  callID: string,
  node: ts.Node,
  callPaths: CallFromData[],
): CallFromData[] {
  if (ts.isClassDeclaration(node)) {
    const findMemember = node.members.find((me) => me.name?.getText() === callID);
    if (findMemember) {
      callPaths.push({
        callSymbol: callID,
        parentClassSymbol: node.name?.getText(),
        originalFileName: node.getSourceFile().fileName,
      });
    }

    let findHeritageNode: ts.Declaration | undefined;
    node.heritageClauses?.forEach((clause) => {
      clause.forEachChild((cchild) => {
        if (ts.isExpressionWithTypeArguments(cchild)) {
          const child = cchild.getChildAt(0) as ts.Identifier;
          const type = program.getTypeChecker().getTypeAtLocation(child);
          findHeritageNode = type.getSymbol()?.valueDeclaration;
        }
      });
    });
    if (findHeritageNode) {
      return getClassCallPaths(program, callID, findHeritageNode, callPaths);
    }
    return callPaths;
  } else if (ts.isMethodDeclaration(node)) {
    return getClassCallPaths(program, callID, node.parent, callPaths);
  } else if (ts.isMethodSignature(node)) {
    let parent: ts.Node | undefined = node.parent;
    while (parent) {
      if (ts.isVariableDeclaration(parent)) {
        callPaths.push({
          callSymbol: callID,
          parentClassSymbol: parent.getChildAt(0).getText(),
          originalFileName: node.getSourceFile().fileName,
        });
        parent = undefined;
        break;
      }
      if (ts.isSourceFile(parent)) {
        break;
      }
      parent = parent.parent;
    }
  } else {
    callPaths.push({
      callSymbol: callID,
      originalFileName: node.getSourceFile().fileName,
    });
  }

  return callPaths;
}

function getCallExpressionsCallFrom(
  node: ts.CallExpression,
  sourceFile: ts.SourceFile,
  program: ts.Program,
): CallFromData | undefined {
  const child1 = node.getChildAt(0, sourceFile);

  let callNode: ts.Identifier | undefined;
  let parentCallNode: ts.Identifier | undefined;
  if (child1.kind === ts.SyntaxKind.PropertyAccessExpression) {
    parentCallNode = child1.getChildAt(0, sourceFile) as ts.Identifier;
    callNode = child1.getChildAt(2, sourceFile) as ts.Identifier;
  } else if (child1.kind === ts.SyntaxKind.Identifier) {
    const child2 = node.getChildAt(1, sourceFile);
    if (child2.kind === ts.SyntaxKind.OpenParenToken) {
      callNode = child1 as ts.Identifier;
      parentCallNode = child1 as ts.Identifier;
    }
  }

  const callNodeText = callNode.getText(sourceFile);
  const parentCallNodeText = parentCallNode.getText(sourceFile);

  if (callNode) {
    console.log(callNodeText, parentCallNodeText, 'callNode');
    const type = program.getTypeChecker().getTypeAtLocation(callNode);
    if (type.getSymbol()?.valueDeclaration) {
      const callPaths = getClassCallPaths(
        program,
        callNode.getText(sourceFile),
        type.getSymbol()?.valueDeclaration,
        [],
      );
    } else {
      const callSigns = program.getTypeChecker().getTypeAtLocation(callNode).getCallSignatures();
      if (callSigns.length && callSigns[0].declaration) {
        const callPaths = getClassCallPaths(
          program,
          callNode.getText(sourceFile),
          callSigns[0].declaration,
          [],
        );
      } else {
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

function getCallExpressions(
  nodes: ts.Node[],
  sourceFile: ts.SourceFile,
  program: ts.Program,
  disableCallIDs: string[],
  callStacks: { callID: string; fromID: string }[],
): ts.CallExpression[] {
  //   const variableDeclarationMap = getNodeAllVariableDeclarationMap(sourceFile, sourceFile);
  const callExpressions: ts.CallExpression[] = [];
  // TODO 返回的结果里需要获取初始调用的信息
  nodes.forEach((node) => {
    ts.forEachChild(node, visit);
  });

  function visit(node: ts.Node, lastCallID?: string) {
    // 被函数体包裹的不递归
    if (!disableCallIDs.find((did) => did === lastCallID)) {
      if (
        node.kind === ts.SyntaxKind.ArrowFunction ||
        node.kind === ts.SyntaxKind.FunctionDeclaration
      ) {
        return;
      }
    }
    let nextLastCallID: string = '';
    if (node.kind === ts.SyntaxKind.CallExpression) {
      const callID = node.getChildAt(0, sourceFile).getText(sourceFile);
      if (!disableCallIDs.find((did) => did === callID)) {
        callExpressions.push(node as ts.CallExpression);
        const data = getCallExpressionsCallFrom(node as ts.CallExpression, sourceFile, program);
        console.log(data, 'CallExpression');
        console.log('\n\n');
        // 不递归这里
        return;
      } else {
        nextLastCallID = callID;
      }
    }

    ts.forEachChild(node, (n) => visit(n, nextLastCallID));
  }
  return callExpressions;
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

  const importProgram = ts.createProgram({
    rootNames: [...rootNames, ...Array.from(importedRelatedFiles)],
    options: {
      declaration: true,
      declarationMap: true,
    },
  });

  const graph = new Graph();

  rootNames.forEach((rootName) => {
    const sourceFile = importProgram.getSourceFile(rootName);
    let nodes = searchCommentNextNodes('#CA.Track.Entry:', sourceFile);
    const functionNames = nodes.map((node) => getFunctionName(node, sourceFile));
    console.log('CA Track Symbols:', functionNames);
    // const importMap = getImportMap(sourceFile);
    const callExpressions = getCallExpressions(
      nodes,
      sourceFile,
      importProgram,
      ['useEffect', 'useCallback', 'useRef'],
      [],
    );

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
