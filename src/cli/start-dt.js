import chalk from "chalk";
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
    chalk.bgGreen("lerna cleaning plz wait");
    await shellJsAsync("lerna clean --yes");
  } catch (error) {
    console.log(error, "error");
  }

  console.log("shellJsAsync shellJsAsync");

  switch (os.platform()) {
    default:
    case "linux":
      await shellJsAsync("rm -rf node_modules");
      break;

    case "win32":
      await shellJsAsync("rmdir node_modules");
      break;
  }

  const dtWebDir = path.join(baseDir, "packages/dt-web");
  if (!fs.existsSync(dtWebDir)) {
    await git.clone(["git@git.xkool.org:xkool_plan/dt_frontend.git"]);
  }
  const dtWebDirGit = simpleGit(dtWebDir);
  await dtWebDirGit.pull([]);

  const packages = ["api", "dt", "graphic", "ui", "utils"];

  let dtWebDirJson = require(path.join(dtWebDir, "package.json"));
  //   const baseDirJson = require(path.join(baseDir, "package.json"));
  console.log(baseDirJson, "dtWebDirJson 11");
  let hasChanged = false;
  for await (packageName of packages) {
    const packageVersion = path.join(
      baseDir,
      `packages/${packageName}/package.json`
    );
    if (dtWebDirJson.dependencies[`@xkool/${packageName}`] !== packageVersion) {
      if (!hasChanged) {
        hasChanged = true;
      }
      dtWebDirJson = {
        ...dtWebDirJson,
        dependencies: {
          ...dtWebDirJson.dependencies,
          [`@xkool/${packageName}`]: packageVersion,
        },
      };
    }
  }
  console.log(baseDirJson, "dtWebDirJson 22");

  if (hasChanged) {
    fs.writeFileSync(JSON.stringify(dtWebDirJson, null, 2));
  }

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

  for await (packageName of packages) {
    const pDir = path.join(baseDir, `packages/${packageName}`);
    await shellJsAsync(`cd packages/${packageName} && npm run build`);
  }

  await shellJsAsync(`cd packages/dt-web && npm run start`);
}
