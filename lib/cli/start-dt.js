"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startDtAction = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require("babel-runtime/helpers/extends");

var _extends4 = _interopRequireDefault(_extends3);

var _asyncIterator2 = require("babel-runtime/helpers/asyncIterator");

var _asyncIterator3 = _interopRequireDefault(_asyncIterator2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var shellJsAsync = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(execStr) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (res) {
              _shelljs2.default.exec(execStr, { async: true }, function () {
                res(true);
              });
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function shellJsAsync(_x) {
    return _ref.apply(this, arguments);
  };
}();

var startDtAction = exports.startDtAction = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var _extends2;

    var baseDir, git, dtWebDir, dtWebDirGit, dtWebDirJson, baseDirJson, baseDirLernaJson, packages, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, pDir;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            baseDir = _shelljs2.default.pwd().stdout;
            git = (0, _simpleGit2.default)(baseDir);
            _context2.next = 4;
            return git.checkout(["feature/integration"]);

          case 4:
            _context2.next = 6;
            return git.pull([]);

          case 6:
            _context2.prev = 6;
            _context2.next = 9;
            return shellJsAsync("lerna clean --yes");

          case 9:
            _context2.next = 14;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](6);

            console.log(_context2.t0, "error");

          case 14:

            console.log("shellJsAsync shellJsAsync");

            _context2.t1 = os.platform();
            _context2.next = _context2.t1 === "linux" ? 18 : _context2.t1 === "win32" ? 20 : 18;
            break;

          case 18:
            shellJsAsync("rm -rf node_modules");
            return _context2.abrupt("break", 22);

          case 20:
            shellJsAsync("rmdir node_modules");
            return _context2.abrupt("break", 22);

          case 22:
            dtWebDir = path.join(baseDir, "packages/dt-web");

            if (fs.existsSync(dtWebDir)) {
              _context2.next = 26;
              break;
            }

            _context2.next = 26;
            return git.clone(["git@git.xkool.org:xkool_plan/dt_frontend.git"]);

          case 26:
            dtWebDirGit = (0, _simpleGit2.default)(dtWebDir);
            _context2.next = 29;
            return dtWebDirGit.pull([]);

          case 29:
            dtWebDirJson = require(path.join(dtWebDir, "package.json"));
            baseDirJson = require(path.join(baseDir, "package.json"));

            dtWebDirJson = (0, _extends4.default)({}, dtWebDirJson, {
              dependencies: (0, _extends4.default)({}, dtWebDirJson.dependencies, (_extends2 = {}, (0, _defineProperty3.default)(_extends2, "@xkool/api", baseDirJson.dependencies["@xkool/api"]), (0, _defineProperty3.default)(_extends2, "@xkool/dt", baseDirJson.dependencies["@xkool/dt"]), (0, _defineProperty3.default)(_extends2, "@xkool/graphic", baseDirJson.dependencies["@xkool/graphic"]), (0, _defineProperty3.default)(_extends2, "@xkool/ui", baseDirJson.dependencies["@xkool/ui"]), (0, _defineProperty3.default)(_extends2, "@xkool/utils", baseDirJson.dependencies["@xkool/utils"]), _extends2))
            });
            fs.writeFileSync(JSON.stringify(dtWebDirJson, null, 2));

            baseDirLernaJson = require(path.join(baseDir, "lerna.json"));

            if (!baseDirLernaJson.packages.find(function (packageName) {
              return packageName === "packages/dt-web";
            }) && baseDirLernaJson.packages[0] !== "packages/*") {
              fs.writeFileSync(JSON.stringify((0, _extends4.default)({}, baseDirLernaJson, {
                packages: [].concat((0, _toConsumableArray3.default)(baseDirLernaJson.packages), ["packages/dt-web"])
              }), null, 2));
            }

            shellJsAsync("lerna bootstrap");

            packages = ["api", "dt", "graphic", "ui", "utils"];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 40;
            _iterator = (0, _asyncIterator3.default)(packages);

          case 42:
            _context2.next = 44;
            return _iterator.next();

          case 44:
            _step = _context2.sent;
            _iteratorNormalCompletion = _step.done;
            _context2.next = 48;
            return _step.value;

          case 48:
            _value = _context2.sent;

            if (_iteratorNormalCompletion) {
              _context2.next = 57;
              break;
            }

            packageName = _value;
            pDir = path.join(baseDir, "packages/" + packageName);
            _context2.next = 54;
            return shellJsAsync("cd packages/" + packageName + " && npm run build");

          case 54:
            _iteratorNormalCompletion = true;
            _context2.next = 42;
            break;

          case 57:
            _context2.next = 63;
            break;

          case 59:
            _context2.prev = 59;
            _context2.t2 = _context2["catch"](40);
            _didIteratorError = true;
            _iteratorError = _context2.t2;

          case 63:
            _context2.prev = 63;
            _context2.prev = 64;

            if (!(!_iteratorNormalCompletion && _iterator.return)) {
              _context2.next = 68;
              break;
            }

            _context2.next = 68;
            return _iterator.return();

          case 68:
            _context2.prev = 68;

            if (!_didIteratorError) {
              _context2.next = 71;
              break;
            }

            throw _iteratorError;

          case 71:
            return _context2.finish(68);

          case 72:
            return _context2.finish(63);

          case 73:
            _context2.next = 75;
            return shellJsAsync("cd packages/dt-web && npm run start");

          case 75:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[6, 11], [40, 59, 63, 73], [64,, 68, 72]]);
  }));

  return function startDtAction() {
    return _ref2.apply(this, arguments);
  };
}();

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

var _simpleGit = require("simple-git");

var _simpleGit2 = _interopRequireDefault(_simpleGit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var os = require("os");
var path = require("path");
var fs = require("fs");