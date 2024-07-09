"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDir = readDir;
const fs_1 = __importDefault(require("fs"));
function readDir(path, options) {
    options = { ...{ recursive: true }, ...options };
    if (!fs_1.default.existsSync(path))
        return [];
    if (!options.recursive)
        return fs_1.default.readdirSync(path);
    const walk = (_dir, _dn) => {
        let results = [];
        let directory = fs_1.default.readdirSync(_dir);
        let file_stats = directory.map(fn => fs_1.default.statSync(`${_dir}/${fn}`));
        let files = directory.filter((fn, idx) => file_stats[idx].isFile());
        let dirs = directory.filter((fn, idx) => file_stats[idx].isDirectory());
        for (let fn of files)
            results.push(`${_dn ? `${_dn}/` : ""}${fn}`);
        for (let dn of dirs)
            results.push(...walk(`${_dir}/${dn}`, dn));
        return results;
    };
    return walk(path);
}
