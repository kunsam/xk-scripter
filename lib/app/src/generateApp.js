"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var fs = require("fs-extra");
var path = require("path");
var chalk = require("chalk");

exports.default = function (basePath, pagePath) {
  // todo 在目录下插入一个套餐
  // if (fs.existsSync(value.absolutePath)) {
  //   console.log(
  //     chalk.red(`>>> [${value.absolutePath}] 已存在，如要更新请删除`)
  //   );
  // } else {
  //   fs.ensureFileSync(value.absolutePath);
  //   fs.writeFile(value.absolutePath, file, () => {
  //     console.log(chalk.yellow(`>>> [${value.absolutePath}] 成功生成`));
  //   });
  // }
};