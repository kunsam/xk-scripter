import * as ts from 'typescript';
import * as path from 'path';

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

const XKOOL_CONTAINER_MAP: Record<string, string> = {
  '@xkool/dt-web': path.join(__dirname, '../../../dt-web/src/index.ts'),
};

const programMap: Map<string, ts.Program> = new Map();
export function getProgramFromPackage(xkoolPackageFileName: string): ts.Program | undefined {
  if (!programMap.has(xkoolPackageFileName)) {
    programMap.set(
      xkoolPackageFileName,
      ts.createProgram({
        rootNames: [xkoolPackageFileName],
        options: {},
      }),
    );
  }
  return programMap.get(xkoolPackageFileName)!;
}

let xkoolProgram: ts.Program | undefined;
export function getXkoolProgram(): ts.Program {
  if (xkoolProgram) {
    return xkoolProgram;
  }
  const rootNames = Object.values({
    ...XKOOL_PACKAGE_MAP,
    ...XKOOL_CONTAINER_MAP,
  });
  const xp = ts.createProgram({
    rootNames: rootNames,
    options: { declaration: false, sourceMap: false },
  });
  xkoolProgram = xp;
  return xp;
}

export function getXkoolProgramAllValidSourceFiles(): ts.SourceFile[] {
  return getXkoolProgram()
    .getSourceFiles()
    .filter((x) => !x.fileName.includes('node_modules') && !x.fileName.includes('dist'));
}
