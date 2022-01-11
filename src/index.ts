import * as path from "path";
import { Command } from "commander";

import chalk from "chalk";

import { DTDOC_LINK } from "./dtdoc.config";
import loopInput from "./loopInput";
import { startDtAction } from "./start-dt";

const program = new Command();

program
  .command("helpdoc")
  .description("show xksciprt doc")
  .action(() => {
    console.log(
      chalk.green(
        "https://www.notion.so/kunsam624/xk-scripter-25dfe18afc854797bde47024a43fedbb"
      )
    );
  });

function recursiveGetResult(clist: any[]) {
  clist.forEach((target, index) => {
    console.log(chalk.white(`${index + 1}. ${target.name}`));
  });
  const chosenIndex = loopInput("请选择：", (input: any) => {
    const choose = input && parseInt(input);
    if (choose && choose > 0 && choose <= clist.length) return choose - 1;
  });
  if (clist[chosenIndex]) {
    if (clist[chosenIndex].link) {
      chalk.green(clist[chosenIndex].link);
    } else if (clist[chosenIndex].children) {
      recursiveGetResult(clist[chosenIndex].children);
    }
  }
}

program
  .command("dtdoc")
  .description("show dt develop doc")
  .action(async () => {
    console.log(chalk.magenta(`\n-- [文档列表]:`));
    DTDOC_LINK.forEach((target: any, index: number) => {
      console.log(chalk.white(`${index + 1}. ${target.name}`));
    });
    const chosenIndex = loopInput("请选择：", (input: any) => {
      const choose = input && parseInt(input);
      if (choose && choose > 0 && choose <= DTDOC_LINK.length)
        return choose - 1;
    });
    if (DTDOC_LINK[chosenIndex]) {
      if (DTDOC_LINK[chosenIndex].link) {
        chalk.green(DTDOC_LINK[chosenIndex].link);
      } else if (DTDOC_LINK[chosenIndex].children) {
        recursiveGetResult(DTDOC_LINK[chosenIndex].children);
      }
    }
  });

program
  .command("dt")
  .description("run a new dt project!")
  .action(() => {
    startDtAction()
      .then(() => {
        chalk.green("start success!");
      })
      .catch((e: any) => {
        chalk.bgRedBright("start error!");
        console.log(e);
      });
  });

program.parse(process.argv);
