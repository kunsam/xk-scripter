import chalk from "chalk";
import * as readlineSync from "readline-sync";

export default function loopInput(question: string, condition: any): any {
  let result = null;
  loop();
  function loop() {
    const input = readlineSync.question(chalk.yellow(`\n${question} `));
    const valid = condition(input);
    if (!valid && valid !== 0) {
      console.log("输入错误，请重新输入");
      loop();
    } else {
      result = valid;
    }
  }
  return result;
}
