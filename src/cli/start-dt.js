import shell from "shelljs";
import simpleGit from "simple-git";
const os = require("os");
const path = require("path");
const fs = require("fs");

async function shellJsAsync(execStr) {
  return new Promise((res) => {
    shell.exec(execStr, { async: true }, () => {
      res(true);
    });
  });
}

export async function startDtAction() {
  const baseDir = shell.pwd().stdout;
  const git = simpleGit(baseDir);
  await git.checkout(["feature/integration"]);
  await git.pull([]);

  try {
    await shellJsAsync("lerna clean --yes");
  } catch (error) {
    console.log(error, "error");
  }

  console.log("shellJsAsync shellJsAsync");

  switch (os.platform()) {
    default:
    case "linux":
      shellJsAsync("rm -rf node_modules");
      break;

    case "win32":
      shellJsAsync("rmdir node_modules");
      break;
  }

  const dtWebDir = path.join(baseDir, "packages/dt-web");
  if (!fs.existsSync(dtWebDir)) {
    await git.clone(["git@git.xkool.org:xkool_plan/dt_frontend.git"]);
  }
  const dtWebDirGit = simpleGit(dtWebDir);
  await dtWebDirGit.pull([]);

  let dtWebDirJson = require(path.join(dtWebDir, "package.json"));
  const baseDirJson = require(path.join(baseDir, "package.json"));
  dtWebDirJson = {
    ...dtWebDirJson,
    dependencies: {
      ...dtWebDirJson.dependencies,
      ["@xkool/api"]: baseDirJson.dependencies["@xkool/api"],
      ["@xkool/dt"]: baseDirJson.dependencies["@xkool/dt"],
      ["@xkool/graphic"]: baseDirJson.dependencies["@xkool/graphic"],
      ["@xkool/ui"]: baseDirJson.dependencies["@xkool/ui"],
      ["@xkool/utils"]: baseDirJson.dependencies["@xkool/utils"],
    },
  };
  fs.writeFileSync(JSON.stringify(dtWebDirJson, null, 2));

  const baseDirLernaJson = require(path.join(baseDir, "lerna.json"));
  if (
    !baseDirLernaJson.packages.find(
      (packageName) => packageName === "packages/dt-web"
    ) &&
    baseDirLernaJson.packages[0] !== "packages/*"
  ) {
    fs.writeFileSync(
      JSON.stringify(
        {
          ...baseDirLernaJson,
          packages: [...baseDirLernaJson.packages, "packages/dt-web"],
        },
        null,
        2
      )
    );
  }

  shellJsAsync("lerna bootstrap");

  const packages = ["api", "dt", "graphic", "ui", "utils"];

  for await (packageName of packages) {
    const pDir = path.join(baseDir, `packages/${packageName}`);
    await shellJsAsync(`cd packages/${packageName} && npm run build`);
  }

  await shellJsAsync(`cd packages/dt-web && npm run start`);
}
