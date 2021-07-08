import * as path from "path";
import { Command } from "commander";
import { PACKAGE_VERSION } from "../src.config";
import {
  getUserMultipleSelectedItems,
  getUserSingleSelectedIndex,
} from "../utils/stdin";
import chalk from "chalk";
import { gcb, gcba, gco, gcoa, gsave, guse, gclear } from "xks-git";
import shell from "shelljs";

const program = new Command();

async function selectDirs(baseDir, dirs, title) {
  if (dirs.length === 0) {
    console.log(chalk.red("不存在子模块"));
    return [];
  }
  const allDirs = [baseDir, ...dirs];
  const selectedIndexes = await getUserMultipleSelectedItems(
    allDirs.map((a) => path.basename(a)),
    title
  );
  let selectedDirs = [];
  if (selectedIndexes.length) {
    selectedIndexes.forEach((indx) => {
      selectedDirs.push(allDirs[indx]);
    });
  }
  return selectedDirs;
}

program
  .command("gcb <branchname>")
  .description(
    "[selectable] checkout new branch for all module project in current directory"
  )
  .action((branchname) => {
    const baseDir = shell.pwd().stdout;
    gcb(baseDir, branchname, async (dirs) => {
      return await selectDirs(baseDir, dirs, "请选择需要切换的project: ");
    })
      .then((success) => {
        if (success) {
          console.log(chalk.yellow("切换成功"));
        }
      })
      .catch((e) => {
        console.log(chalk.yellow("gcb error", e));
      });
  });

program
  .command("gcba <branchname>")
  .description(
    "checkout new branch for all module project in current directory"
  )
  .action((branchname) => {
    const baseDir = shell.pwd().stdout;
    gcba(baseDir, branchname)
      .then((success) => {
        if (success) {
          console.log(chalk.yellow("切换成功"));
        }
      })
      .catch((e) => {
        console.log(chalk.yellow("gcba error", e));
      });
  });

program
  .command("gco <branchname>")
  .description(
    "[selectable] checkout <branchname> for all module project in current directory"
  )
  .action((branchname) => {
    const baseDir = shell.pwd().stdout;
    gco(baseDir, branchname, async (dirs) => {
      return await selectDirs(baseDir, dirs, "请选择需要切换的project: ");
    })
      .then((success) => {
        if (success) {
          console.log(chalk.yellow("切换成功"));
        }
      })
      .catch((e) => {
        console.log(chalk.yellow("gco error", e));
      });
  });

program
  .command("gcoa <branchname>")
  .description(
    "checkout <branchname> for all module project in current directory"
  )
  .action((branchname) => {
    const baseDir = shell.pwd().stdout;
    gcoa(baseDir, branchname)
      .then((success) => {
        if (success) {
          console.log(chalk.yellow("切换成功"));
        }
      })
      .catch((e) => {
        console.log(chalk.yellow("gcoa error", e));
      });
  });

program
  .command("gsave <featureId>")
  .description(
    "save all no-dev changed module current git state with featureId"
  )
  .action((featureId) => {
    const baseDir = shell.pwd().stdout;
    gsave({ baseDir, featureId })
      .then(({ erroMsg }) => {
        if (erroMsg) {
          console.log(chalk.yellow("gsave error", erroMsg));
          return;
        } else {
          console.log(chalk.yellow("gsave success"));
        }
      })
      .catch((e) => {
        console.log(chalk.yellow("gsave error", e));
      });
  });

program
  .command("guse")
  .description("use selected featureId to restore git state correspondingly")
  .action(() => {
    const baseDir = shell.pwd().stdout;
    guse({
      baseDir,
      selectFeatureId: async (featureIds) => {
        const selectedIndex = await getUserSingleSelectedIndex(
          featureIds,
          "plz choose a featureId"
        );
        if (typeof selectedIndex === "number") {
          return featureIds[selectedIndex];
        }
        return "";
      },
    }).catch((e) => {
      console.log(chalk.yellow("guse error", e));
    });
  });

program
  .command("gclear")
  .description("use selected featureId to restore git state correspondingly")
  .action(() => {
    const baseDir = shell.pwd().stdout;
    let hasFeatureIds = true;
    gclear({
      baseDir,
      selectFeatureId: async (featureIds) => {
        if (!featureIds) {
          hasFeatureIds = false;
          return "";
        }
        const selectedIndex = await getUserSingleSelectedIndex(
          featureIds,
          "plz choose a featureId"
        );
        if (typeof selectedIndex === "number") {
          return featureIds[selectedIndex];
        }
        return "";
      },
    })
      .catch((e) => {
        console.log(chalk.yellow("guse error", e));
      })
      .finally(() => {
        if (!hasFeatureIds) {
          console.log(chalk.green("clear success!"));
        }
      });
  });

program
  .command("document_link")
  .description("show doc link")
  .action(() => {
    console.log(
      chalk.green(
        "https://www.notion.so/kunsam624/xk-scripter-25dfe18afc854797bde47024a43fedbb"
      )
    );
  });
program.version(PACKAGE_VERSION, "-v, --vers", "output the current version");

program.parse(process.argv);
