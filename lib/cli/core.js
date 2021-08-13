"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var selectDirs = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(baseDir, dirs, title) {
    var allDirs, selectedIndexes, selectedDirs;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(dirs.length === 0)) {
              _context.next = 3;
              break;
            }

            console.log(_chalk2.default.red("不存在子模块"));
            return _context.abrupt("return", []);

          case 3:
            allDirs = [baseDir].concat((0, _toConsumableArray3.default)(dirs));
            _context.next = 6;
            return (0, _stdin.getUserMultipleSelectedItems)(allDirs.map(function (a) {
              return path.basename(a);
            }), title);

          case 6:
            selectedIndexes = _context.sent;
            selectedDirs = [];

            if (selectedIndexes.length) {
              selectedIndexes.forEach(function (indx) {
                selectedDirs.push(allDirs[indx]);
              });
            }
            return _context.abrupt("return", selectedDirs);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function selectDirs(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _path = require("path");

var path = _interopRequireWildcard(_path);

var _commander = require("commander");

var _src = require("../src.config");

var _stdin = require("../utils/stdin");

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _xksGit = require("xks-git");

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

var _startDt = require("./start-dt");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var program = new _commander.Command();

program.command("gcb <branchname>").description("[selectable] checkout new branch for all module project in current directory").action(function (branchname) {
  var baseDir = _shelljs2.default.pwd().stdout;
  (0, _xksGit.gcb)(baseDir, branchname, function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(dirs) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return selectDirs(baseDir, dirs, "请选择需要切换的project: ");

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x4) {
      return _ref2.apply(this, arguments);
    };
  }()).then(function (success) {
    if (success) {
      console.log(_chalk2.default.yellow("切换成功"));
    }
  }).catch(function (e) {
    console.log(_chalk2.default.yellow("gcb error", e));
  });
});

program.command("gcba <branchname>").description("checkout new branch for all module project in current directory").action(function (branchname) {
  var baseDir = _shelljs2.default.pwd().stdout;
  (0, _xksGit.gcba)(baseDir, branchname).then(function (success) {
    if (success) {
      console.log(_chalk2.default.yellow("切换成功"));
    }
  }).catch(function (e) {
    console.log(_chalk2.default.yellow("gcba error", e));
  });
});

program.command("gco <branchname>").description("[selectable] checkout <branchname> for all module project in current directory").action(function (branchname) {
  var baseDir = _shelljs2.default.pwd().stdout;
  (0, _xksGit.gco)(baseDir, branchname, function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(dirs) {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return selectDirs(baseDir, dirs, "请选择需要切换的project: ");

            case 2:
              return _context3.abrupt("return", _context3.sent);

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    }));

    return function (_x5) {
      return _ref3.apply(this, arguments);
    };
  }()).then(function (success) {
    if (success) {
      console.log(_chalk2.default.yellow("切换成功"));
    }
  }).catch(function (e) {
    console.log(_chalk2.default.yellow("gco error", e));
  });
});

program.command("gcoa <branchname>").description("checkout <branchname> for all module project in current directory").action(function (branchname) {
  var baseDir = _shelljs2.default.pwd().stdout;
  (0, _xksGit.gcoa)(baseDir, branchname).then(function (success) {
    if (success) {
      console.log(_chalk2.default.yellow("切换成功"));
    }
  }).catch(function (e) {
    console.log(_chalk2.default.yellow("gcoa error", e));
  });
});

program.command("gsave <featureId>").description("save all no-dev changed module current git state with featureId").action(function (featureId) {
  var baseDir = _shelljs2.default.pwd().stdout;
  (0, _xksGit.gsave)({ baseDir: baseDir, featureId: featureId }).then(function (_ref4) {
    var erroMsg = _ref4.erroMsg;

    if (erroMsg) {
      console.log(_chalk2.default.yellow("gsave error", erroMsg));
      return;
    } else {
      console.log(_chalk2.default.yellow("gsave success"));
    }
  }).catch(function (e) {
    console.log(_chalk2.default.yellow("gsave error", e));
  });
});

program.command("guse").description("use selected featureId to restore git state correspondingly").action(function () {
  var baseDir = _shelljs2.default.pwd().stdout;
  (0, _xksGit.guse)({
    baseDir: baseDir,
    selectFeatureId: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(featureIds) {
        var selectedIndex;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _stdin.getUserSingleSelectedIndex)(featureIds, "plz choose a featureId");

              case 2:
                selectedIndex = _context4.sent;

                if (!(typeof selectedIndex === "number")) {
                  _context4.next = 5;
                  break;
                }

                return _context4.abrupt("return", featureIds[selectedIndex]);

              case 5:
                return _context4.abrupt("return", "");

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, undefined);
      }));

      return function selectFeatureId(_x6) {
        return _ref5.apply(this, arguments);
      };
    }()
  }).catch(function (e) {
    console.log(_chalk2.default.yellow("guse error", e));
  });
});

program.command("gclear").description("use selected featureId to restore git state correspondingly").action(function () {
  var baseDir = _shelljs2.default.pwd().stdout;
  var hasFeatureIds = true;
  (0, _xksGit.gclear)({
    baseDir: baseDir,
    selectFeatureId: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(featureIds) {
        var selectedIndex;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (featureIds) {
                  _context5.next = 3;
                  break;
                }

                hasFeatureIds = false;
                return _context5.abrupt("return", "");

              case 3:
                _context5.next = 5;
                return (0, _stdin.getUserSingleSelectedIndex)(featureIds, "plz choose a featureId");

              case 5:
                selectedIndex = _context5.sent;

                if (!(typeof selectedIndex === "number")) {
                  _context5.next = 8;
                  break;
                }

                return _context5.abrupt("return", featureIds[selectedIndex]);

              case 8:
                return _context5.abrupt("return", "");

              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, undefined);
      }));

      return function selectFeatureId(_x7) {
        return _ref6.apply(this, arguments);
      };
    }()
  }).catch(function (e) {
    console.log(_chalk2.default.yellow("guse error", e));
  }).finally(function () {
    if (!hasFeatureIds) {
      console.log(_chalk2.default.green("clear success!"));
    }
  });
});

program.command("document_link").description("show doc link").action(function () {
  console.log(_chalk2.default.green("https://www.notion.so/kunsam624/xk-scripter-25dfe18afc854797bde47024a43fedbb"));
});

program.command("startDt").description("use selected featureId to restore git state correspondingly").action(function () {
  (0, _startDt.startDtAction)().then(function () {
    _chalk2.default.green("start success!");
  }).catch(function (e) {
    _chalk2.default.bgRedBright("start error!");
    console.log(e);
  });
});

program.version(_src.PACKAGE_VERSION, "-v, --vers", "output the current version");

program.parse(process.argv);