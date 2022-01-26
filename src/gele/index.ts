import * as fs from "fs";
import * as path from "path";
import { createDOFromDTOCommand } from "./createDOfromDTO";
import chalk from "chalk";
import { createBOfromDOCommand } from "./createBOfromDO";
import { lowerFirst, upperFirst } from "lodash";
import { createGuideCommand } from "./guide";
import { CustomConfig, PathConfig } from "./typing";
import { createLeftMenuOptionsCommand } from "./leftMenuOptions";
import { createCanvasObjectCommand } from "./createCanvasObject";

const DEFAULT_PATH_CONFIG: PathConfig = {
  javadtoPath: "xkGele/javadto.ts",
  configPath: "xkGele/xele.config.json",
  svgFolderPath: "xkGele/svg",
  guidePath: "xkGele/guide.md",
  svgAssetFolderPath: "packages/dt/src/assets",

  modelFilePath: "packages/dt/src/models/project/projectDO",
  modelBOFilePath: "packages/dt/src/models/project/projectBO",
  canvasObjectPath: "packages/dt/src/2dRenderer/canvasObjects",
  leftMenuConfigPath: "packages/dt/src/models/project/tag",
};

function makeSureWrite(filepath: string, fileName: string, code: string) {
  let doFilePath = path.join(filepath, fileName);
  if (fs.existsSync(doFilePath)) {
    const number = new Date().getTime().toString().slice(0, 5);
    doFilePath = path.join(filepath, `${number}.${fileName}`);
    chalk.green(`${fileName} exist! use a new filename: ${number}.${fileName}`);
  }
  fs.writeFileSync(doFilePath, code);
}

function readConfig(configPath: string): CustomConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`${configPath} Not Exist!`);
    return;
  }
  const configText = fs.readFileSync(configPath).toString();
  return JSON.parse(configText);
}

export function generatorAllElementCodeInPrime() {
  try {
    const userConfig = readConfig(DEFAULT_PATH_CONFIG.configPath);
    const config = Object.assign(userConfig, {
      pathConfig: Object.assign(
        DEFAULT_PATH_CONFIG,
        userConfig.pathConfig || {}
      ),
    });
    console.log(config, "configconfig");
    const { code, interfacesArgs } = createDOFromDTOCommand(
      config.pathConfig.javadtoPath
    );

    const lowerFirstElementName = lowerFirst(userConfig.elementName);

    // write DO
    makeSureWrite(
      config.pathConfig.modelFilePath,
      `${lowerFirstElementName}DO.model.ts`,
      code
    );

    // write BO
    const findDoInerface = interfacesArgs.find((arg) =>
      arg.name.includes(userConfig.elementName)
    );
    if (findDoInerface) {
      const boCode = createBOfromDOCommand(findDoInerface);
      makeSureWrite(
        config.pathConfig.modelBOFilePath,
        `${lowerFirstElementName}BO.model.ts`,
        boCode
      );
    }

    // canvasObject

    const canvasObjectCode = createCanvasObjectCommand(lowerFirstElementName);
    makeSureWrite(
      config.pathConfig.canvasObjectPath,
      `XK${upperFirst(userConfig.elementName)}CanvasObject.ts`,
      canvasObjectCode
    );

    // options
    const leftOptionsCode = createLeftMenuOptionsCommand(
      lowerFirstElementName,
      userConfig.elementType,
      config.pathConfig.svgFolderPath,
      config.pathConfig.svgAssetFolderPath
    );
    makeSureWrite(
      config.pathConfig.leftMenuConfigPath,
      `${lowerFirstElementName}.ts`,
      leftOptionsCode
    );

    // guide
    fs.writeFileSync(
      config.pathConfig.guidePath,
      createGuideCommand({
        enumName: userConfig.elementType.enumTypeName,
      })
    );
  } catch (e) {
    console.log(e, "Error in generatorAllElementCodeInPrime");
  }
}
