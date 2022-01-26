import * as path from "path";

function getPath(rpath: string) {
  return path.join(process.cwd(), rpath);
}

export function createGuideCommand({ enumName }: { enumName: string }) {
  return `
        # 添加 DO export
        file://${getPath("packages/dt/src/models/project/projectDO/index.ts")}

        // todo 可以在 packages/dt/src/enums 下添加默认配置

        # 添加 BO export
        file://${getPath("packages/dt/src/models/project/projectBO/index.ts")}

        # 添加 CanvasObject export
        file://${getPath("packages/dt/src/2dRenderer/canvasObjects/index.ts")}

        # 添加 Options export
        file://${getPath("packages/dt/src/models/project/tag/index.ts")}

        
        # 搜索 [GTODO:leftMenuOptions]: 把这段代码放到
        file://${getPath(
          "packages/dt-web/src/pages/Project/components/ObjectCreatePanel/ObjectCreatePanel.tsx"
        )}

        # 搜索 [${enumName}]: 把代码放到 ComponentOptionTypeUnion 中
        file://${getPath("packages/dt/src/models/project/tag/component.ts")}

    `;
}
