import { IInterfacePropsArgs } from "./typing";

import { lowerFirst } from "lodash";

export function standardBOFileTemplate(doInerface: IInterfacePropsArgs) {
  const elementName = doInerface.name.replace("DO", "");
  const lowerFirstName = lowerFirst(elementName);
  const boName = `${elementName}BO`;
  const doName = `${elementName}DO`;
  return `
/** 本代码由小库前端ai生成 */
import { generateId } from '@xkool/graphic';
import { GeometryBase } from './geometryBase.model';
import type {
    ${doName},
} from '../projectDO/${lowerFirst(doName)}.model';

export class ${boName} extends GeometryBase {

    public id: number

    ${doInerface.basicProps
      .map((prop) => `public ${prop.name}: ${prop.type};\n`)
      .join("\n")}

    constructor(
        id: number,
        doProps: {
            ${doInerface.basicProps
              .map((prop) => `${prop.name}: ${prop.type},`)
              .join("\n")}
        },
        options: {}
    ) {
        super([]);
        this.id = id;
        ${doInerface.basicProps
          .map((prop) => `this.${prop.name} = doProps.${prop.name};`)
          .join("\n")}
    }

    public static createByDO(${lowerFirstName}: ${doName}) {
        // NOTICE: GeometryBase默认 Y轴反转
        const ${lowerFirstName}BO = new ${boName}(
            ${lowerFirstName}.id || generateId(),
            {
                ${doInerface.basicProps
                  .map((prop) => `${prop.name}: ${lowerFirstName}.${prop.name}`)
                  .join(",\n")}
            },
            {}
        )
        return ${lowerFirstName}BO;
    }

    public clone(needGenerateId: boolean = true): ${boName} {
        const ${lowerFirstName} = new ${boName}(
            needGenerateId ? generateId() : this.id,
            {
                ${doInerface.basicProps
                  .map((prop) => `${prop.name}: this.${prop.name}`)
                  .join(",\n")}
            },
            {}
        );
        return ${lowerFirstName};
    }

    /*
    public check(list: CheckedTarget[]) {
        return true
    }
    */
}
`;
}

export function createBOfromDOCommand(doInerface: IInterfacePropsArgs) {
  return standardBOFileTemplate(doInerface);
}
