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
  //   await git.checkout(["feature/integration"]);
  await git.pull([]);

  try {
    chalk.bgGreen("lerna cleaning start, plz wait!");
    await shellJsAsync("lerna clean --yes");
  } catch (error) {
    console.log(error, "error");
  }

  switch (os.platform()) {
    default:
    case "linux":
      await shellJsAsync("rm -rf node_modules");
      break;

    case "win32":
      await shellJsAsync("rmdir node_modules");
      break;
  }

  const dtWebDir = path.join(baseDir, "./packages/dt-web");
  if (!fs.existsSync(dtWebDir)) {
    await git.clone(["git@git.xkool.org:xkool_plan/dt_frontend.git"]);
  }
  const dtWebDirGit = simpleGit(dtWebDir);
  await dtWebDirGit.pull([]);

  const packages = ["api", "dt", "graphic", "ui", "utils"];

  let dtWebDirJson = require(path.join(dtWebDir, "package.json"));

  let hasChanged = false;
  for await (let packageName of packages) {
    const packageVersion = require(path.join(
      baseDir,
      `./packages/${packageName}/package.json`
    )).version;
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

  if (hasChanged) {
    fs.writeFileSync(
      path.join(dtWebDir, "package.json"),
      JSON.stringify(dtWebDirJson, null, 2)
    );
  }
  const baseDirLernaJson = require(path.join(baseDir, "lerna.json"));
  if (
    !baseDirLernaJson.packages.find(
      (packageName) => packageName === "packages/dt-web"
    ) &&
    baseDirLernaJson.packages[0] !== "packages/*"
  ) {
    console.log("write!!!!");
    fs.writeFileSync(
      path.join(baseDir, "./lerna.json"),
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

  chalk.bgGreen("lerna bootstrap start, plz wait!");
  await shellJsAsync("lerna bootstrap");

  for await (let packageName of packages) {
    await shellJsAsync(`cd packages/${packageName} && npm run build`);
  }

  chalk.greenBright("All done! Now you can go to dt-web and run start!");
  //   await shellJsAsync(`cd packages/dt-web && npm run start`);
}
