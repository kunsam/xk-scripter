import chalk from "chalk";
import readlineSync from "readline-sync";

export async function getUserMultipleSelectedItems(list, title) {
  console.log(chalk.cyan(title));
  list.forEach((data, index) => {
    console.log(`${index + 1}. ${chalk.grey(data)}`);
  });
  console.log("\n");
  const inputText = readlineSync.question("请输入选择（多选用逗号隔开,|，）: ");
  if (!inputText) {
    console.log(chalk.red("未输入"));
    return [];
  }
  const seletedIndexes = inputText
    .replace(/，/g, ",")
    .split(",")
    .filter((a) => a !== undefined)
    .map((text) => parseInt(text))
    .filter((a) => typeof a === "number")
    .map((n) => n - 1);
  return seletedIndexes;
}

export async function getUserSingleSelectedIndex(list, title) {
  console.log(chalk.cyan(title));
  list.forEach((data, index) => {
    console.log(`${index + 1}. ${chalk.grey(data)}`);
  });

  console.log("\n");
  const inputText = readlineSync.question("请输入选择（单选）: ");
  if (!inputText) {
    console.log(chalk.red("未输入"));
    return null;
  }
  const numberInputText = parseInt(inputText);
  if (typeof numberInputText !== "number") {
    console.log(chalk.red("格式不正确"));
    return null;
  }
  return numberInputText - 1;
}
