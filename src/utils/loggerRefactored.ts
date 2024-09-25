/** @file Reusable functions for using `console.log()`, but in 4k ultra HD retrocolor. */

import { Shard } from "discord.js";
import jt from "@utils/jsTools";
import chalk from "chalk";

import { name as PROJECT } from "@pkgJSON";
import config from "@configs";

function __format(str: string): string {
    const { LOG_TIMESTAMPS } = config.logger;

    str = str
        .replace("::TIMESTAMP ", LOG_TIMESTAMPS ? `[${new Date().toLocaleTimeString()}] ` : "")

        .replace("::CLIENT", "[CLIENT]")
        .replace("::ACM_LOCAL", "[ACM/LOCAL]")
        .replace("::ACM_GLOBAL", "[ACM/GLOBAL]")

        .replace("::IMPORTER", "[IMPORTER]")
        .replace("::IMPORT_EVENT", "[IMPORT/EVENT]")
        .replace("::IMPORT_COMMAND", "[IMPORT/COMMAND]")

        .replace("::COMMAND", "[COMMAND]")
        .replace("::EVENT", "[EVENT]")
        .replace("::MONGO", "[🥭 MONGO]");

    return chalk`${str}`;
}

/* - - - - - { Exports } - - - - - */
export function debug(msg: string): void {
    console.log(__format(`::TIMESTAMP ${chalk.hex("#C45AB3").italic(msg)}`));
}

debug("This is a test debug.");

export function log(msg: string): void {
    console.log(__format(`::TIMESTAMP ${chalk.italic.gray(msg)}`));
}

log("This is a test log.");

export function error(header: string, msg: string, err: any = ""): void {
    console.error(__format(`::TIMESTAMP ${chalk.bgRed("ERROR!")} ${chalk.bold.red(header)} ${msg}`), err);
}

error("::CLIENT", "This is a test error.", "This is an error message.");

export function success(msg: string): void {
    console.log(__format(chalk.greenBright(`::TIMESTAMP ${msg}`)));
}

success("This is a test success.");

export default { debug, error, log, success };
