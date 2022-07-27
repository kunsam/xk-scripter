import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// TODO: 可能还需要完善
export function declarationFileName2FileName(dfilename: string) {
  return dfilename.replace(/dist/, 'src').replace(/\.d\.ts$/, '.ts');
}

interface ImportData {
  path: string;
  isPackage: boolean;
  isReletivePath: boolean;
  isAsType: boolean;
  isDefaultImport?: boolean;
}

export function getImportMap(sourceFile: ts.SourceFile): Map<string, ImportData> {
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
        const firstChild = cnode.getChildAt(0, sourceFile);
        const isAsType = firstChild.kind === ts.SyntaxKind.TypeKeyword;
        const isReletivePath =
          path.startsWith("'@/") || path.startsWith("'./") || path.startsWith("'../");

        const ccnode = cnode.getChildren().find((n) => n.kind === ts.SyntaxKind.NamedImports);
        if (ts.isIdentifier(firstChild) && !ccnode) {
          map.set(firstChild.getText(sourceFile), {
            path,
            isAsType,
            isReletivePath,
            isPackage: !isReletivePath,
            isDefaultImport: true,
          });
          return;
        }

        if (ccnode) {
          ccnode.forEachChild((cccnode) => {
            cccnode.forEachChild((ccccnode) => {
              if (ccccnode.kind === ts.SyntaxKind.Identifier) {
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

function getWithExtFilename(filename: string): string {
  if (fs.existsSync(filename)) return filename;
  if (fs.existsSync(`${filename}.ts`)) return `${filename}.ts`;
  if (fs.existsSync(`${filename}.tsx`)) return `${filename}.tsx`;
  if (fs.existsSync(`${filename}/index.ts`)) return `${filename}/index.ts`;
  if (fs.existsSync(`${filename}/index.tsx`)) return `${filename}/index.tsx`;
  return filename;
}

export function getResolvedPath(currentFileName: string, relativePath: string): string {
  let purePath = relativePath.replace(/\'/g, '');
  if (purePath.startsWith('@/')) {
    const prefixPath = currentFileName.match(/^(.)+frontend_prime\/packages\/.+?\//)[0];
    const filename = getWithExtFilename(
      path.join(prefixPath, 'src', purePath.replace(/\@\//g, '')),
    );
    return filename;
  }
  if (purePath.startsWith('./')) {
    purePath = purePath.replace(/^\.\//, '');
    const currentFileNameWithoutLast = currentFileName.split('/');
    currentFileNameWithoutLast.pop();
    return getWithExtFilename(path.join(currentFileNameWithoutLast.join('/'), purePath));
  }
  return getWithExtFilename(path.join(currentFileName, purePath));
}

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
