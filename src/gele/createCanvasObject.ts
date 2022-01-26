import { upperFirst, camelCase, snakeCase, toUpper } from "lodash";

export function createCanvasObject(name: string) {
  const upperFirstName = upperFirst(name);
  const Ctype = snakeCase(camelCase(name))
    .split("_")
    .map((v) => toUpper(v))
    .join("_");

  return `
import { CanvasObjectTypeEnum } from './../../enums/canvasObject';
import type { ${upperFirstName}BO } from './../../models/project/projectBO/${name}BO.model';
import { CanvasGroup } from './CanvasGroup';

interface XK${upperFirstName}CanvasObjectData {
    value: ${upperFirstName}BO;
    [key: string]: any;
}

export class XK${upperFirstName}CanvasObject extends CanvasGroup {

    constructor(
        ${name}: ${upperFirstName}BO,
        objectList: fabric.Object[],
        data: XK${upperFirstName}CanvasObjectData,
    ) {
        super(
            objectList,
            stepComponent.id,
            CanvasObjectTypeEnum.${Ctype}, // GTODO: 跳转声明一下
            data,
            undefined,
            undefined,
            undefined,
            true,
        );
        this.data = data;
    }

    private static getObjectList(${name}: ${upperFirstName}BO) {
        const objectList: fabric.Object[] = [];
        // GTODO: 写一下对象创建逻辑
        return objectList
    }


    public static createByBO(${name}: ${upperFirstName}BO) {
        const objList = this.getObjectList(${name})
        return new XK${upperFirstName}CanvasObject(
            ${name},
            objList,
            { value: ${name} },
        );
    }
}
        
`;
}

export function createCanvasObjectCommand(name: string) {
  return createCanvasObject(name);
}
