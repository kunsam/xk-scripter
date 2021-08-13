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
            _context2.next = 8;
            return shellJsAsync("lerna clean");

          case 8:

            console.log("shellJsAsync shellJsAsync");
            _context2.t0 = os.platform();
            _context2.next = _context2.t0 === "linux" ? 12 : _context2.t0 === "win32" ? 14 : 12;
            break;

          case 12:
            shellJsAsync("rm -rf node_modules");
            return _context2.abrupt("break", 16);

          case 14:
            shellJsAsync("rmdir node_modules");
            return _context2.abrupt("break", 16);

          case 16:
            dtWebDir = path.join(baseDir, "packages/dt-web");

            if (fs.existsSync(dtWebDir)) {
              _context2.next = 20;
              break;
            }

            _context2.next = 20;
            return git.clone(["git@git.xkool.org:xkool_plan/dt_frontend.git"]);

          case 20:
            dtWebDirGit = (0, _simpleGit2.default)(dtWebDir);
            _context2.next = 23;
            return dtWebDirGit.pull([]);

          case 23:
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
            _context2.prev = 34;
            _iterator = (0, _asyncIterator3.default)(packages);

          case 36:
            _context2.next = 38;
            return _iterator.next();

          case 38:
            _step = _context2.sent;
            _iteratorNormalCompletion = _step.done;
            _context2.next = 42;
            return _step.value;

          case 42:
            _value = _context2.sent;

            if (_iteratorNormalCompletion) {
              _context2.next = 51;
              break;
            }

            packageName = _value;
            pDir = path.join(baseDir, "packages/" + packageName);
            _context2.next = 48;
            return shellJsAsync("cd packages/" + packageName + " && npm run build");

          case 48:
            _iteratorNormalCompletion = true;
            _context2.next = 36;
            break;

          case 51:
            _context2.next = 57;
            break;

          case 53:
            _context2.prev = 53;
            _context2.t1 = _context2["catch"](34);
            _didIteratorError = true;
            _iteratorError = _context2.t1;

          case 57:
            _context2.prev = 57;
            _context2.prev = 58;

            if (!(!_iteratorNormalCompletion && _iterator.return)) {
              _context2.next = 62;
              break;
            }

            _context2.next = 62;
            return _iterator.return();

          case 62:
            _context2.prev = 62;

            if (!_didIteratorError) {
              _context2.next = 65;
              break;
            }

            throw _iteratorError;

          case 65:
            return _context2.finish(62);

          case 66:
            return _context2.finish(57);

          case 67:
            _context2.next = 69;
            return shellJsAsync("cd packages/dt-web && npm run start");

          case 69:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[34, 53, 57, 67], [58,, 62, 66]]);
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