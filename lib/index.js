"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var chalk_1 = require("chalk");
var dtdoc_config_1 = require("./dtdoc.config");
var loopInput_1 = require("./loopInput");
var start_dt_1 = require("./start-dt");
var program = new commander_1.Command();
program
    .command("helpdoc")
    .description("show xksciprt doc")
    .action(function () {
    console.log(chalk_1.default.green("https://www.notion.so/kunsam624/xk-scripter-25dfe18afc854797bde47024a43fedbb"));
});
function recursiveGetResult(clist) {
    clist.forEach(function (target, index) {
        console.log(chalk_1.default.white("".concat(index + 1, ". ").concat(target.name)));
    });
    var chosenIndex = (0, loopInput_1.default)("请选择：", function (input) {
        var choose = input && parseInt(input);
        if (choose && choose > 0 && choose <= clist.length)
            return choose - 1;
    });
    if (clist[chosenIndex]) {
        if (clist[chosenIndex].link) {
            console.log("\u6587\u6863\u5730\u5740\uFF1A".concat(clist[chosenIndex].link));
        }
        else if (clist[chosenIndex].children) {
            recursiveGetResult(clist[chosenIndex].children);
        }
    }
}
program
    .command("dtdoc")
    .description("show dt develop doc")
    .action(function () {
    console.log(chalk_1.default.magenta("\n-- [\u6587\u6863\u5217\u8868]:"));
    dtdoc_config_1.DTDOC_LINK.forEach(function (target, index) {
        console.log(chalk_1.default.white("".concat(index + 1, ". ").concat(target.name)));
    });
    try {
        var chosenIndex = (0, loopInput_1.default)("请选择：", function (input) {
            var choose = input && parseInt(input);
            if (choose && choose > 0 && choose <= dtdoc_config_1.DTDOC_LINK.length)
                return choose - 1;
        });
        if (dtdoc_config_1.DTDOC_LINK[chosenIndex]) {
            if (dtdoc_config_1.DTDOC_LINK[chosenIndex].link) {
                console.log("\u6587\u6863\u5730\u5740\uFF1A".concat(dtdoc_config_1.DTDOC_LINK[chosenIndex].link));
            }
            else if (dtdoc_config_1.DTDOC_LINK[chosenIndex].children) {
                recursiveGetResult(dtdoc_config_1.DTDOC_LINK[chosenIndex].children);
            }
        }
    }
    catch (e) {
        console.log(e, "wanring!");
    }
});
program
    .command("dt")
    .description("run a new dt project!")
    .action(function () {
    (0, start_dt_1.startDtAction)()
        .then(function () {
        chalk_1.default.green("start success!");
    })
        .catch(function (e) {
        chalk_1.default.bgRedBright("start error!");
        console.log(e);
    });
});
