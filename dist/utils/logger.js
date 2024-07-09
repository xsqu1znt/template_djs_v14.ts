"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = debug;
exports.error = error;
exports.log = log;
exports.success = success;
const chalk_1 = __importDefault(require("chalk"));
function debug(msg) {
    console.log(chalk_1.default.magenta(msg));
}
function error(header, msg, err = "") {
    console.error(chalk_1.default.black.bgRed(header) + " " + chalk_1.default.magenta(msg), err);
}
function log(msg) {
    console.log(chalk_1.default.gray(msg));
}
function success(msg) {
    console.log(chalk_1.default.gray(msg));
}
