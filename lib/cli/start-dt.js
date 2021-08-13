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
    var baseDir, git, dtWebDir, dtWebDirGit, packages, dtWebDirJson, hasChanged, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, packageVersion, baseDirLernaJson, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, pDir;

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

            _chalk2.default.bgGreen("lerna cleaning plz wait");
            _context2.next = 10;
            return shellJsAsync("lerna clean --yes");

          case 10:
            _context2.next = 15;
            break;

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2["catch"](6);

            console.log(_context2.t0, "error");

          case 15:

            console.log("shellJsAsync shellJsAsync");

            _context2.t1 = os.platform();
            _context2.next = _context2.t1 === "linux" ? 19 : _context2.t1 === "win32" ? 22 : 19;
            break;

          case 19:
            _context2.next = 21;
            return shellJsAsync("rm -rf node_modules");

          case 21:
            return _context2.abrupt("break", 25);

          case 22:
            _context2.next = 24;
            return shellJsAsync("rmdir node_modules");

          case 24:
            return _context2.abrupt("break", 25);

          case 25:
            dtWebDir = path.join(baseDir, "packages/dt-web");

            if (fs.existsSync(dtWebDir)) {
              _context2.next = 29;
              break;
            }

            _context2.next = 29;
            return git.clone(["git@git.xkool.org:xkool_plan/dt_frontend.git"]);

          case 29:
            dtWebDirGit = (0, _simpleGit2.default)(dtWebDir);
            _context2.next = 32;
            return dtWebDirGit.pull([]);

          case 32:
            packages = ["api", "dt", "graphic", "ui", "utils"];
            dtWebDirJson = require(path.join(dtWebDir, "package.json"));
            //   const baseDirJson = require(path.join(baseDir, "package.json"));

            console.log(baseDirJson, "dtWebDirJson 11");
            hasChanged = false;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 39;
            _iterator = (0, _asyncIterator3.default)(packages);

          case 41:
            _context2.next = 43;
            return _iterator.next();

          case 43:
            _step = _context2.sent;
            _iteratorNormalCompletion = _step.done;
            _context2.next = 47;
            return _step.value;

          case 47:
            _value = _context2.sent;

            if (_iteratorNormalCompletion) {
              _context2.next = 55;
              break;
            }

            packageName = _value;
            packageVersion = path.join(baseDir, "packages/" + packageName + "/package.json");

            if (dtWebDirJson.dependencies["@xkool/" + packageName] !== packageVersion) {
              if (!hasChanged) {
                hasChanged = true;
              }
              dtWebDirJson = (0, _extends4.default)({}, dtWebDirJson, {
                dependencies: (0, _extends4.default)({}, dtWebDirJson.dependencies, (0, _defineProperty3.default)({}, "@xkool/" + packageName, packageVersion))
              });
            }

          case 52:
            _iteratorNormalCompletion = true;
            _context2.next = 41;
            break;

          case 55:
            _context2.next = 61;
            break;

          case 57:
            _context2.prev = 57;
            _context2.t2 = _context2["catch"](39);
            _didIteratorError = true;
            _iteratorError = _context2.t2;

          case 61:
            _context2.prev = 61;
            _context2.prev = 62;

            if (!(!_iteratorNormalCompletion && _iterator.return)) {
              _context2.next = 66;
              break;
            }

            _context2.next = 66;
            return _iterator.return();

          case 66:
            _context2.prev = 66;

            if (!_didIteratorError) {
              _context2.next = 69;
              break;
            }

            throw _iteratorError;

          case 69:
            return _context2.finish(66);

          case 70:
            return _context2.finish(61);

          case 71:
            console.log(baseDirJson, "dtWebDirJson 22");

            if (hasChanged) {
              fs.writeFileSync(JSON.stringify(dtWebDirJson, null, 2));
            }

            baseDirLernaJson = require(path.join(baseDir, "lerna.json"));

            if (!baseDirLernaJson.packages.find(function (packageName) {
              return packageName === "packages/dt-web";
            }) && baseDirLernaJson.packages[0] !== "packages/*") {
              fs.writeFileSync(JSON.stringify((0, _extends4.default)({}, baseDirLernaJson, {
                packages: [].concat((0, _toConsumableArray3.default)(baseDirLernaJson.packages), ["packages/dt-web"])
              }), null, 2));
            }

            shellJsAsync("lerna bootstrap");

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 79;
            _iterator2 = (0, _asyncIterator3.default)(packages);

          case 81:
            _context2.next = 83;
            return _iterator2.next();

          case 83:
            _step2 = _context2.sent;
            _iteratorNormalCompletion2 = _step2.done;
            _context2.next = 87;
            return _step2.value;

          case 87:
            _value2 = _context2.sent;

            if (_iteratorNormalCompletion2) {
              _context2.next = 96;
              break;
            }

            packageName = _value2;
            pDir = path.join(baseDir, "packages/" + packageName);
            _context2.next = 93;
            return shellJsAsync("cd packages/" + packageName + " && npm run build");

          case 93:
            _iteratorNormalCompletion2 = true;
            _context2.next = 81;
            break;

          case 96:
            _context2.next = 102;
            break;

          case 98:
            _context2.prev = 98;
            _context2.t3 = _context2["catch"](79);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t3;

          case 102:
            _context2.prev = 102;
            _context2.prev = 103;

            if (!(!_iteratorNormalCompletion2 && _iterator2.return)) {
              _context2.next = 107;
              break;
            }

            _context2.next = 107;
            return _iterator2.return();

          case 107:
            _context2.prev = 107;

            if (!_didIteratorError2) {
              _context2.next = 110;
              break;
            }

            throw _iteratorError2;

          case 110:
            return _context2.finish(107);

          case 111:
            return _context2.finish(102);

          case 112:
            _context2.next = 114;
            return shellJsAsync("cd packages/dt-web && npm run start");

          case 114:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[6, 12], [39, 57, 61, 71], [62,, 66, 70], [79, 98, 102, 112], [103,, 107, 111]]);
  }));

  return function startDtAction() {
    return _ref2.apply(this, arguments);
  };
}();

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

var _simpleGit = require("simple-git");

var _simpleGit2 = _interopRequireDefault(_simpleGit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var os = require("os");
var path = require("path");
var fs = require("fs");