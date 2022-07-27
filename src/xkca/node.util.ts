import * as ts from 'typescript';
import { GraphID } from './graph';
import { declarationFileName2FileName, getImportMap, getResolvedPath } from './file.util';
import { program } from 'commander';

function getClassCallPaths(
  program: ts.Program,
  callID: string,
  node: ts.Node,
  callPaths: GraphID[],
): GraphID[] {
  if (ts.isClassDeclaration(node)) {
    const findMemember = node.members.find((me) => me.name?.getText() === callID);
    if (findMemember) {
      callPaths.push({
        nodeSymbol: callID,
        parentCallSymbol: node.name?.getText(),
        fileName: node.getSourceFile().fileName,
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
          nodeSymbol: callID,
          parentCallSymbol: parent.getChildAt(0).getText(),
          fileName: node.getSourceFile().fileName,
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
      nodeSymbol: callID,
      fileName: node.getSourceFile().fileName,
    });
  }

  return callPaths;
}

function getNodeReturnClass(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  program: ts.Program,
): ts.Identifier | undefined {
  let findClassID: ts.Identifier | undefined;
  if (ts.isNewExpression(node)) {
    const targetid = node.getChildAt(1, sourceFile);
    if (ts.isIdentifier(targetid)) {
      findClassID = targetid;
    }
  } else if (ts.isCallExpression(node)) {
    const checker = program.getTypeChecker();
    const edec = checker.getTypeAtLocation(node.expression).getSymbol()?.valueDeclaration;
    if (edec && (ts.isArrowFunction(edec) || ts.isFunctionDeclaration(edec))) {
      findClassID = getFunctionCallReturnClass(edec, sourceFile, program);
    }
  }
  return findClassID;
}

function getInstanceClass(
  instanceId: string,
  sourceFile: ts.SourceFile,
  program: ts.Program,
): ts.Identifier | undefined {
  let findClassID: ts.Identifier | undefined;
  ts.forEachChild(sourceFile, visit);
  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      const findSameId = node.declarationList.declarations.find(
        (dec) => dec.name.getText(sourceFile) === instanceId,
      );
      if (findSameId) {
        node.declarationList.declarations.find((dec) => {
          // dec is VariableDeclaration
          const child2 = dec.getChildAt(2, sourceFile);
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

function getPropertyDeclarationReturnClass(
  node: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
  program: ts.Program,
): ts.Identifier | undefined {
  const findEqualTokenIndex = node
    .getChildren()
    .findIndex((c) => c.kind === ts.SyntaxKind.EqualsToken);
  if (findEqualTokenIndex >= 0) {
    const child = node.getChildAt(findEqualTokenIndex + 1, sourceFile);
    if (child) {
      return getNodeReturnClass(child, sourceFile, program);
    }
  }
  return undefined;
}

function getFunctionCallReturnClass(
  fnode: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile,
  program: ts.Program,
): ts.Identifier | undefined {
  let findClassID: ts.Identifier | undefined;
  ts.forEachChild(fnode, visit);
  function visit(node: ts.Node) {
    if (ts.isReturnStatement(node)) {
      const child1 = node.getChildAt(1, sourceFile);
      if (ts.isNewExpression(child1)) {
        const targetid = child1.getChildAt(1, sourceFile);
        if (ts.isIdentifier(targetid)) {
          findClassID = targetid;
        }
      } else {
        const findReturnId = node.getChildren().find((c) => c.kind === ts.SyntaxKind.Identifier);
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

export function getCallExpressionGraphIDs(
  node: ts.CallExpression,
  sourceFile: ts.SourceFile,
  program: ts.Program,
  depth: number,
): GraphID[] {
  const child1 = node.getChildAt(0, sourceFile);

  const checker = program.getTypeChecker();
  let callNode: ts.Identifier | undefined;
  let parentCallNodeString: string | undefined;

  // 这一段的多样性会非常多
  if (child1.kind === ts.SyntaxKind.PropertyAccessExpression) {
    const firstNode = child1.getChildAt(0, sourceFile);
    const thNode = child1.getChildAt(2, sourceFile);
    if (ts.isIdentifier(firstNode)) {
      parentCallNodeString = firstNode.getText(sourceFile);
    } else if (ts.isCallExpression(firstNode)) {
      const type = checker.getTypeAtLocation(firstNode.getChildAt(0, sourceFile));
      const func2Signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];

      if (func2Signature.getReturnType().aliasSymbol) {
        parentCallNodeString = checker.typeToString(func2Signature.getReturnType());
      } else {
        const dec = func2Signature.getDeclaration();
        if (ts.isArrowFunction(dec) || ts.isFunctionDeclaration(dec)) {
          parentCallNodeString = getFunctionCallReturnClass(dec, sourceFile, program)?.getText(
            sourceFile,
          );
        }
      }
    } else if (ts.isPropertyAccessExpression(firstNode)) {
      const checker = program.getTypeChecker();
      const type = checker.getTypeAtLocation(firstNode.expression);
      const dec = type.getSymbol().valueDeclaration;
      if (ts.isClassDeclaration(dec)) {
        const memberName = firstNode.getChildAt(2, sourceFile).getText(sourceFile);
        const funcSymbol = type.getProperty(memberName);
        const fdec = funcSymbol?.valueDeclaration;
        if (fdec && ts.isPropertyDeclaration(fdec)) {
          if (fdec.type) {
            parentCallNodeString = fdec.type?.getText(sourceFile);
          } else {
            parentCallNodeString = getPropertyDeclarationReturnClass(
              fdec,
              sourceFile,
              program,
            )?.getText(sourceFile);
          }
        }
      }
    }
    if (ts.isIdentifier(thNode)) {
      callNode = thNode;
    }
  } else if (child1.kind === ts.SyntaxKind.Identifier) {
    callNode = child1 as ts.Identifier;
    // const child2 = node.getChildAt(1, sourceFile);
    // // 这里的限制可能会很大！
    // if (child2.kind === ts.SyntaxKind.OpenParenToken) {
    //   callNode = child1 as ts.Identifier;
    // }
  }

  if (callNode) {
    const type = program.getTypeChecker().getTypeAtLocation(callNode);

    if (type.getSymbol()?.valueDeclaration) {
      if (type.getSymbol()?.valueDeclaration?.getSourceFile().fileName !== sourceFile.fileName) {
        console.log(
          new Array(depth + 1).fill('\t') + `${depth}[getCallExpressionGraphIDs]: `,
          'case 1',
        );
        const callPaths = getClassCallPaths(
          program,
          callNode.getText(sourceFile),
          type.getSymbol()?.valueDeclaration,
          [],
        );
        return callPaths.map((data) => ({
          ...data,
          fileName: declarationFileName2FileName(data.fileName),
        }));
      }
    } else {
      const callSigns = program.getTypeChecker().getTypeAtLocation(callNode).getCallSignatures();
      if (callSigns.length && callSigns[0].declaration) {
        if (callSigns[0].declaration.getSourceFile().fileName !== sourceFile.fileName) {
          console.log(
            new Array(depth + 1).fill('\t') + `${depth}[getCallExpressionGraphIDs]: `,
            'case 2',
          );
          const callPaths = getClassCallPaths(
            program,
            callNode.getText(sourceFile),
            callSigns[0].declaration,
            [],
          );
          return callPaths.map((data) => ({
            ...data,
            fileName: declarationFileName2FileName(data.fileName),
          }));
        }
      }
    }

    if (callNode) {
      if (parentCallNodeString) {
        const instanceClass = getInstanceClass(parentCallNodeString, sourceFile, program);
        if (instanceClass) {
          parentCallNodeString = instanceClass.getText(sourceFile);
        }
      }
      const importMap = getImportMap(sourceFile);
      const pathData = importMap.get(parentCallNodeString || callNode.getText(sourceFile));
      if (pathData) {
        const absPath = getResolvedPath(sourceFile.fileName, pathData.path);
        const otherSourceFile = program.getSourceFile(absPath);
        const otherNode = getNodeBySymbol(
          parentCallNodeString || callNode.getText(sourceFile),
          otherSourceFile,
        );

        if (otherSourceFile && otherNode) {
          const callPaths = getClassCallPaths(program, callNode.getText(sourceFile), otherNode, []);
          console.log(
            new Array(depth + 1).fill('\t') + `${depth}[getCallExpressionGraphIDs]: `,
            'case 自定义解析',
          );
          return callPaths.map((data) => ({
            ...data,
            parentCallSymbol: parentCallNodeString,
            fileName: declarationFileName2FileName(data.fileName),
          }));
        }
      } else {
        const findInCurrentFile = getFunctionDeclarationBySymbol(
          callNode.getText(sourceFile),
          sourceFile,
        );
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

export function getNodeBySymbol(symbol: string, sourceFile: ts.SourceFile): ts.Node | undefined {
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

export function getFunctionDeclarationBySymbol(
  symbol: string,
  sourceFile: ts.SourceFile,
): ts.FunctionDeclaration | ts.VariableDeclaration | undefined {
  let findNode: ts.FunctionDeclaration | ts.VariableDeclaration | undefined;
  const visit = (fnode: ts.Node) => {
    if (findNode) return;
    if (ts.isFunctionDeclaration(fnode)) {
      if (fnode.name?.getText(sourceFile) === symbol) {
        findNode = fnode;
      }
    } else if (ts.isVariableDeclaration(fnode)) {
      const findArrowFunction = fnode.getChildren().find((c) => ts.isArrowFunction(c));
      if (findArrowFunction && fnode.name?.getText(sourceFile) === symbol) {
        findNode = fnode;
      }
    }
    if (findNode) return;
    ts.forEachChild(fnode, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return findNode;
}
