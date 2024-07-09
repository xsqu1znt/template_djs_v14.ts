import fs from "fs";

/** Get an array of file paths inside of a folder. */
export function readDir(path: string, options?: readDirOptions): string[] {
    options = { ...{ recursive: true }, ...options };

    // Check if the file path exists first
    if (!fs.existsSync(path)) return [];

    if (!options.recursive) return fs.readdirSync(path);

    const walk = (_dir: string, _dn?: string): string[] => {
        let results: string[] = [];

        let directory = fs.readdirSync(_dir);

        let file_stats = directory.map(fn => fs.statSync(`${_dir}/${fn}`));
        let files = directory.filter((fn, idx) => file_stats[idx].isFile());
        let dirs = directory.filter((fn, idx) => file_stats[idx].isDirectory());

        for (let fn of files) results.push(`${_dn ? `${_dn}/` : ""}${fn}`);
        for (let dn of dirs) results.push(...walk(`${_dir}/${dn}`, dn));

        return results;
    };

    return walk(path);
}
