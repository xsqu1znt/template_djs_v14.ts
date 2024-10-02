/** @file Reusable functions for using `console.log()`, but in 4k ultra HD retrocolor. */

import { Shard } from "discord.js";
import jt from "@utils/jsTools";
import chalk from "chalk";

import { name as PROJECT } from "@pkgJSON";
import config from "@configs";

const { COLORS } = config.logger;

function __format(str: string): string {
    const { LOG_TIMESTAMPS } = config.logger;

    str = str
        .replace("::TIMESTAMP ", LOG_TIMESTAMPS ? `[${new Date().toLocaleTimeString()}] ` : "")

        .replace("::CLIENT", chalk.bold.gray("[CLIENT]"))
        .replace("::ACM_LOCAL", "[ACM/LOCAL]")
        .replace("::ACM_GLOBAL", "[ACM/GLOBAL]")

        .replace("::IMPORTER", "[IMPORTER]")
        .replace("::IMPORT_EVENT", chalk.bold.gray("[~/EVENT]"))
        .replace("::IMPORT_COMMAND", "[~/COMMAND]")

        .replace("::COMMAND", "[COMMAND]")
        .replace("::EVENT", "[EVENT]")
        .replace("::MONGO", "[🥭 MONGO]");

    return chalk`${str}`;
}

function __log(msg: string): void {
    console.log(__format(`::TIMESTAMP ${msg}`));
}

function __error(msg: string, err: any): void {
    console.error(__format(`::TIMESTAMP ${msg}`), err);
}

/* - - - - - { Base } - - - - - */
export function log(msg: string): void {
    __log(chalk.italic.gray(msg));
}

export function debug(msg: string): void {
    __log(chalk.hex(COLORS.DEBUG).italic(msg));
}

export function error(header: string, msg: string, err: any = ""): void {
    __error(`${chalk.bgRed("ERROR!")} ${chalk.bold.red(header)} ${msg}`, err);
}

export function success(msg: string): void {
    __log(chalk.greenBright(msg));
}

/* - - - - - { Client } - - - - - */
export const client = {
    starting: (): void => __log(`::CLIENT ⏳ ${chalk.italic(jt.choice(config.logger.STARTUP_MESSAGES))}`),
    connecting: (): void => __log(`::CLIENT ⏳ ${chalk.italic("Connecting to Discord...")}`),
    online: (): void => __log(`::CLIENT ✅ ${chalk.green("Successfuly connected to Discord!")}`),
    ready: () => __log(`::CLIENT ✅ ${chalk.green(`${chalk.bold.underline(PROJECT)} is up and running!`)} 🎉`)
};

/* - - - - - { utils/importers } - - - - - */
export const importer = {
    event: (event: string, path: string, enabled: boolean): void => {
        const _msg = `${chalk.hex(COLORS.EVENT_NAME).bold(event)} ${chalk.italic.gray(path)}`;
        __log(`::IMPORT_EVENT ${enabled ? _msg : chalk.strikethrough(_msg)}`);
    }
};

/* - - - - - { Testing } - - - - - */
log("This is a test log.");
debug("This is a test debug.");
error("::CLIENT", "This is a test error.", "This is an error message.");
success("This is a test success.");

console.log("");

client.starting();
client.connecting();
client.online();
client.ready();

console.log("");

importer.event("0_setStatus.ts", "./events/ready/0_setStatus.ts", true);
importer.event("9_botReady.ts", "./events/ready/9_botReady.ts", false);

export default { debug, error, log, success };
