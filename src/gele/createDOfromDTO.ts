import * as ts from "typescript";
import * as fs from "fs";

const test = `
public class StepComponentDTO extends BaseHatchDTO {

    /** 台阶类型 */
    private StepComponentType stepType;

    /** 台阶长(台阶矩形上下的边长) */
    private double length;

    /** 是否有平台 */
    private boolean hasPlatform;

    /** 平台宽(台阶矩形左右的边长) */
    private double platformWidth;

    /** 踏步宽 */
    private double stepWidth;

    /** 踏步高 */
    private double stepHeight;

    /** 踏步数 */
    private double stepNum;

    /** 台阶高度 */
    private double selfHeight;

    /** 台阶顶离地高度 */
    private double groundClearance;

    /** 栏杆位置 */
    private List<RectEdgePosition> railingPositions;

    /** 栏杆配置 */
    private RailingParamsDTO railingParams;
}

public enum StepComponentType {
    /** 单侧，必定为下 */
    SINGLE = '123',
    /** 双侧相邻，必定为下、右 */
    CLOSED_SIDES = 2,
    /** 双侧对边，必定为左、右 */
    OPPOSITE_SIDES = 3,
    /** 三侧，必定为左、下、右 */
    THREE_SIDES = 4;
}

/**
 * 栏杆
 */
public class RailingParamsDTO {

  /** 栏杆高度 （栏杆高度 + 反坎高度 = 总高度） */
  private double railingHeight;

  /** 反坎高度 */
  private double baseRailHeight;

  /** 栏杆后端 */
  private double railingThickness;
}

`;

interface BasicProps {
  name: string;
  type: string;
  comment: string;
}

interface BasicEnum {
  name: string;
  value: string;
  comment: string;
}

function getEnum(enumName: string, enums: BasicEnum[]) {
  return `
export enum ${enumName} {
    ${enums
      .map((enumv) => {
        return `${enumv.comment ? `/** ${enumv.comment} */\n` : ""}${
          enumv.name
        } = ${enumv.value}`;
      })
      .join(",\n")}
}
`;
}

interface IInterfacePropsArgs {
  name: string;
  refers: string[];
  heritageClause?: string;
  basicProps: BasicProps[];
}

function transJavaType(type: string) {
  switch (type) {
    case "double": {
      return "number";
    }
    default: {
      return type;
    }
  }
}

function getInterfaceCode({
  name,
  refers,
  basicProps,
  heritageClause,
}: IInterfacePropsArgs) {
  return `
${refers.map((r) => `${r}\n`)}
export interface ${name} ${heritageClause || ""} {
    ${basicProps
      .map((prop) => {
        return `${prop.comment ? `/** ${prop.comment} */\n` : ""}${
          prop.name
        }: ${transJavaType(prop.type)};\n`;
      })
      .join("")}
}`;
}

// export enum StepComponentType {
//     SINGLE(1),
//     /** 双侧相邻，必定为下、右 */
//     CLOSED_SIDES(2),
//     /** 双侧对边，必定为左、右 */
//     OPPOSITE_SIDES(3),
//     /** 三侧，必定为左、下、右 */
//     THREE_SIDES(4);
// }

function isNodeChildrenMatch(
  kinds: { index: number; kind: ts.SyntaxKind }[],
  node: ts.Node
) {
  const childKinds: ts.SyntaxKind[] = [];
  node.forEachChild((cnode) => {
    childKinds.push(cnode.kind);
  });
  return kinds.reduce((p, c) => {
    return p && childKinds[c.index] === c.kind;
  }, true);
}

function resolvePropertyDeclaration(
  node: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile
): BasicProps {
  const props: BasicProps = {
    name: "",
    type: "",
    comment: "",
  };
  if ((node as any).jsDoc[0]?.comment) {
    props.comment = (node as any).jsDoc[0]?.comment || "";
  }
  const isMatch = isNodeChildrenMatch(
    [
      {
        index: 1,
        kind: ts.SyntaxKind.Identifier,
      },
      {
        index: 2,
        kind: ts.SyntaxKind.Identifier,
      },
    ],
    node
  );
  let index = 0;
  node.forEachChild((cnode) => {
    if (!isMatch) {
    } else {
      if (index === 1) {
        props.type = cnode.getText(sourceFile);
      }
      if (index === 2) {
        props.name = cnode.getText(sourceFile);
      }
      index += 1;
    }
  });
  return props;
}

function resolveClassDeclaration(
  node: ts.ClassDeclaration,
  sourceFile: ts.SourceFile
) {
  let isShowed = false;
  let args: IInterfacePropsArgs = {
    name: "",
    heritageClause: "",
    refers: [],
    basicProps: [],
  };

  let prevMatchedType: string | undefined;
  let prevMatchedComment: string | undefined;
  let prevMatchedList: boolean = false;
  let prevMatchedListType: string | undefined;
  const basicProps: BasicProps[] = [];
  node.forEachChild((cnode) => {
    if (cnode.kind === ts.SyntaxKind.HeritageClause) {
      args.heritageClause = cnode.getText(sourceFile);
      return;
    }
    if (cnode.kind === ts.SyntaxKind.PropertyDeclaration) {
      if ((cnode as any).jsDoc) {
        prevMatchedComment = (cnode as any).jsDoc[0]?.comment || "";
      }
      if (prevMatchedList && prevMatchedListType) {
        basicProps.push({
          type: prevMatchedListType,
          name: cnode.getText(sourceFile).replace(";", ""),
          comment: prevMatchedComment,
        });
        prevMatchedList = false;
        prevMatchedListType = undefined;
        return;
      }
      cnode.forEachChild((ccnode) => {
        if (prevMatchedType) {
          basicProps.push({
            type: prevMatchedType,
            name: ccnode.getText(sourceFile),
            comment: prevMatchedComment,
          });
          prevMatchedType = undefined;
          prevMatchedComment = undefined;
        } else {
          if (ccnode.kind === ts.SyntaxKind.Identifier) {
            prevMatchedType = ccnode.getText(sourceFile);
          }
        }
      });
      //   resolvePropertyDeclaration(cnode as ts.PropertyDeclaration, sourceFile);
      return;
    }
    if (cnode.kind === ts.SyntaxKind.MethodDeclaration) {
      if ((cnode as any).jsDoc) {
        prevMatchedComment = (cnode as any).jsDoc[0]?.comment || "";
      }
      cnode.forEachChild((ccnode) => {
        if (
          ccnode.kind === ts.SyntaxKind.Identifier &&
          ccnode.getText(sourceFile) === "List"
        ) {
          prevMatchedList = true;
        }
        if (prevMatchedList && ccnode.kind === ts.SyntaxKind.TypeParameter) {
          prevMatchedListType = `${ccnode
            .getText(sourceFile)
            .replace(";", "")}[]`;
        }
      });
      return;
    }
    if (cnode.kind === ts.SyntaxKind.Identifier) {
      args.name = cnode.getText(sourceFile);
      return;
    }
  });
  args.basicProps = basicProps;
  return args;
}

export function createDOFromDTO(fileContent: string) {
  const tempPath = `temp.${Math.random().toFixed(8)}.ts`;
  const targetPath = `XK_COPY_ME.ts`;

  try {
    fs.writeFileSync(tempPath, fileContent);
    const interfacesArgs: IInterfacePropsArgs[] = [];
    let code: string = "";

    const program = ts.createProgram({ rootNames: [tempPath], options: {} });
    const sourceFile = program.getSourceFile(tempPath);
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node)) {
        const args = resolveClassDeclaration(node, sourceFile);
        interfacesArgs.push(args);
        // console.log(args, "argsargsargsargs");
        code += getInterfaceCode(args);
        code += "\n";
      }
      if (ts.isEnumDeclaration(node)) {
        let enumName = "";
        const enums: BasicEnum[] = [];
        node.forEachChild((cnode) => {
          if (cnode.kind === ts.SyntaxKind.Identifier) {
            enumName = cnode.getText(sourceFile);
          }
          if (cnode.kind === ts.SyntaxKind.EnumMember) {
            let name = "";
            let value = "";

            const comment = (cnode as any).jsDoc[0]?.comment || "";

            cnode.forEachChild((ccnode) => {
              if (ccnode.kind === ts.SyntaxKind.Identifier) {
                name = ccnode.getText(sourceFile);
              }
              if (name) {
                if (
                  ccnode.kind === ts.SyntaxKind.NumericLiteral ||
                  ccnode.kind === ts.SyntaxKind.StringLiteral
                ) {
                  value = ccnode.getText(sourceFile);
                  enums.push({
                    comment,
                    name,
                    value,
                  });
                }
              }
            });
          }
        });
        code += getEnum(enumName, enums);
      }
    });
    // console.log(code, "code");
    fs.writeFileSync(targetPath, `/** 本代码由小库前端ai生成 */${code}`);
    fs.unlinkSync(tempPath);
  } catch (e) {
    console.log(e, "error");
    fs.unlinkSync(tempPath);
    fs.unlinkSync(targetPath);
  }
}

// createDOFromDTO(test);
