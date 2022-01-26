export interface IInterfacePropsArgs {
  name: string;
  refers: string[];
  heritageClause?: string;
  basicProps: BasicProps[];
}

export interface BasicProps {
  name: string;
  type: string;
  comment: string;
}

export interface BasicEnum {
  name: string;
  value: string;
  comment: string;
}

export interface ElementType {
  enumTypeName: string;
  enumNames: {
    enumName: string;
    name: string;
    fullName: string;
  }[];
}

export interface PathConfig {
  guidePath: string;
  configPath: string;
  javadtoPath: string;
  svgFolderPath: string;
  svgAssetFolderPath: string;

  modelFilePath: string;
  modelBOFilePath: string;
  canvasObjectPath: string
  leftMenuConfigPath: string;
}

export interface CustomConfig {
  pathConfig?: PathConfig;
  elementName: string;
  elementType: ElementType;
}
