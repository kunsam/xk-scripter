"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserSingleSelectedIndex = exports.getUserMultipleSelectedItems = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getUserMultipleSelectedItems = exports.getUserMultipleSelectedItems = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(list, title) {
    var inputText, seletedIndexes;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log(_chalk2.default.cyan(title));
            list.forEach(function (data, index) {
              console.log(index + 1 + ". " + _chalk2.default.grey(data));
            });
            console.log("\n");
            inputText = _readlineSync2.default.question("请输入选择（多选用逗号隔开,|，）: ");

            if (inputText) {
              _context.next = 7;
              break;
            }

            console.log(_chalk2.default.red("未输入"));
            return _context.abrupt("return", []);

          case 7:
            seletedIndexes = inputText.replace(/，/g, ",").split(",").filter(function (a) {
              return a !== undefined;
            }).map(function (text) {
              return parseInt(text);
            }).filter(function (a) {
              return typeof a === "number";
            }).map(function (n) {
              return n - 1;
            });
            return _context.abrupt("return", seletedIndexes);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function getUserMultipleSelectedItems(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var getUserSingleSelectedIndex = exports.getUserSingleSelectedIndex = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(list, title) {
    var inputText, numberInputText;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log(_chalk2.default.cyan(title));
            list.forEach(function (data, index) {
              console.log(index + 1 + ". " + _chalk2.default.grey(data));
            });

            console.log("\n");
            inputText = _readlineSync2.default.question("请输入选择（单选）: ");

            if (inputText) {
              _context2.next = 7;
              break;
            }

            console.log(_chalk2.default.red("未输入"));
            return _context2.abrupt("return", null);

          case 7:
            numberInputText = parseInt(inputText);

            if (!(typeof numberInputText !== "number")) {
              _context2.next = 11;
              break;
            }

            console.log(_chalk2.default.red("格式不正确"));
            return _context2.abrupt("return", null);

          case 11:
            return _context2.abrupt("return", numberInputText - 1);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function getUserSingleSelectedIndex(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _readlineSync = require("readline-sync");

var _readlineSync2 = _interopRequireDefault(_readlineSync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }