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
    var baseDir, git, dtWebDir, dtWebDirGit, packages, dtWebDirJson, hasChanged, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, packageName, packageVersion, baseDirLernaJson, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, _packageName;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            baseDir = _shelljs2.default.pwd().stdout;
            git = (0, _simpleGit2.default)(baseDir);
            //   await git.checkout(["feature/integration"]);

            _context2.next = 4;
            return git.pull([]);

          case 4:
            _context2.prev = 4;

            _chalk2.default.bgGreen("lerna cleaning start, plz wait!");
            _context2.next = 8;
            return shellJsAsync("lerna clean --yes");

          case 8:
            _context2.next = 13;
            break;

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](4);

            console.log(_context2.t0, "error");

          case 13:
            _context2.t1 = os.platform();
            _context2.next = _context2.t1 === "linux" ? 16 : _context2.t1 === "win32" ? 19 : 16;
            break;

          case 16:
            _context2.next = 18;
            return shellJsAsync("rm -rf node_modules");

          case 18:
            return _context2.abrupt("break", 22);

          case 19:
            _context2.next = 21;
            return shellJsAsync("rmdir node_modules");

          case 21:
            return _context2.abrupt("break", 22);

          case 22:
            dtWebDir = path.join(baseDir, "./packages/dt-web");

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
            packages = ["api", "dt", "graphic", "ui", "utils"];
            dtWebDirJson = require(path.join(dtWebDir, "package.json"));
            hasChanged = false;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 35;
            _iterator = (0, _asyncIterator3.default)(packages);

          case 37:
            _context2.next = 39;
            return _iterator.next();

          case 39:
            _step = _context2.sent;
            _iteratorNormalCompletion = _step.done;
            _context2.next = 43;
            return _step.value;

          case 43:
            _value = _context2.sent;

            if (_iteratorNormalCompletion) {
              _context2.next = 51;
              break;
            }

            packageName = _value;
            packageVersion = require(path.join(baseDir, "./packages/" + packageName + "/package.json")).version;

            if (dtWebDirJson.dependencies["@xkool/" + packageName] !== packageVersion) {
              if (!hasChanged) {
                hasChanged = true;
              }
              dtWebDirJson = (0, _extends4.default)({}, dtWebDirJson, {
                dependencies: (0, _extends4.default)({}, dtWebDirJson.dependencies, (0, _defineProperty3.default)({}, "@xkool/" + packageName, packageVersion))
              });
            }

          case 48:
            _iteratorNormalCompletion = true;
            _context2.next = 37;
            break;

          case 51:
            _context2.next = 57;
            break;

          case 53:
            _context2.prev = 53;
            _context2.t2 = _context2["catch"](35);
            _didIteratorError = true;
            _iteratorError = _context2.t2;

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

            if (hasChanged) {
              fs.writeFileSync(path.join(dtWebDir, "package.json"), JSON.stringify(dtWebDirJson, null, 2));
            }
            baseDirLernaJson = require(path.join(baseDir, "lerna.json"));

            if (!baseDirLernaJson.packages.find(function (packageName) {
              return packageName === "packages/dt-web";
            }) && baseDirLernaJson.packages[0] !== "packages/*") {
              console.log("write!!!!");
              fs.writeFileSync(path.join(baseDir, "./lerna.json"), JSON.stringify((0, _extends4.default)({}, baseDirLernaJson, {
                packages: [].concat((0, _toConsumableArray3.default)(baseDirLernaJson.packages), ["packages/dt-web"])
              }), null, 2));
            }

            _chalk2.default.bgGreen("lerna bootstrap start, plz wait!");
            _context2.next = 73;
            return shellJsAsync("lerna bootstrap");

          case 73:
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 76;
            _iterator2 = (0, _asyncIterator3.default)(packages);

          case 78:
            _context2.next = 80;
            return _iterator2.next();

          case 80:
            _step2 = _context2.sent;
            _iteratorNormalCompletion2 = _step2.done;
            _context2.next = 84;
            return _step2.value;

          case 84:
            _value2 = _context2.sent;

            if (_iteratorNormalCompletion2) {
              _context2.next = 92;
              break;
            }

            _packageName = _value2;
            _context2.next = 89;
            return shellJsAsync("cd packages/" + _packageName + " && npm run build");

          case 89:
            _iteratorNormalCompletion2 = true;
            _context2.next = 78;
            break;

          case 92:
            _context2.next = 98;
            break;

          case 94:
            _context2.prev = 94;
            _context2.t3 = _context2["catch"](76);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t3;

          case 98:
            _context2.prev = 98;
            _context2.prev = 99;

            if (!(!_iteratorNormalCompletion2 && _iterator2.return)) {
              _context2.next = 103;
              break;
            }

            _context2.next = 103;
            return _iterator2.return();

          case 103:
            _context2.prev = 103;

            if (!_didIteratorError2) {
              _context2.next = 106;
              break;
            }

            throw _iteratorError2;

          case 106:
            return _context2.finish(103);

          case 107:
            return _context2.finish(98);

          case 108:

            _chalk2.default.greenBright("All done! Now you can go to dt-web and run start!");
            //   await shellJsAsync(`cd packages/dt-web && npm run start`);

          case 109:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[4, 10], [35, 53, 57, 67], [58,, 62, 66], [76, 94, 98, 108], [99,, 103, 107]]);
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