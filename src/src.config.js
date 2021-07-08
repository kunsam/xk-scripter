import path from "path";

const packJson = require("../package.json");

// 命令行执行路径
export const PACKAGE_VERSION = packJson.version;
// export const PROJECT_BASE_PATH = shell.pwd().stdout
export const PACKAGE_BASE_PATH = path.join(__dirname, "../");
