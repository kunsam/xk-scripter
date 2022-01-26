import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { ElementType } from "./typing";

export function createLeftMenuOptions(name: string, elementType: ElementType) {
  return `
/** 本代码由小库前端ai生成 */
import type { ComponentOption } from './component';
${elementType.enumNames
  .map(
    (type) =>
      `import l_${type.enumName} from '../../../assets/${name}/light/${type.enumName}.svg'`
  )
  .join("\n")}
${elementType.enumNames
  .map(
    (type) =>
      `import d_${type.enumName} from '../../../assets/${name}/dark/${type.enumName}.svg'`
  )
  .join("\n")}

// GTODO:leftMenuOptions
export const ${name}Options: ComponentOption[] = [
    ${elementType.enumNames
      .map(
        (type) => `{
        label: '${type.fullName}',
        type: ${elementType.enumTypeName}.${type.enumName},
        size: [],
        icon: d_${type.enumName},
        dark: d_${type.enumName},
        light: l_${type.enumName}
    }`
      )
      .join(",\n")}
]

`;
}

export function createLeftMenuOptionsCommand(
  name: string,
  elementType: ElementType,
  svgFolderPath: string,
  svgAssetPath: string
) {
  if (fs.existsSync(path.join(svgFolderPath, "白"))) {
    fs.renameSync(
      path.join(svgFolderPath, "白"),
      path.join(svgFolderPath, "light")
    );
    fs.renameSync(
      path.join(svgFolderPath, "黑"),
      path.join(svgFolderPath, "dark")
    );
    elementType.enumNames.forEach((data) => {
      fs.renameSync(
        path.join(svgFolderPath, "light", `${data.name}.svg`),
        path.join(svgFolderPath, "light", `${data.enumName}.svg`)
      );
      fs.renameSync(
        path.join(svgFolderPath, "dark", `${data.name}.svg`),
        path.join(svgFolderPath, "dark", `${data.enumName}.svg`)
      );
    });
  }

  fse.copySync(svgFolderPath, path.join(svgAssetPath, `/${name}`));
  return createLeftMenuOptions(name, elementType);
}
