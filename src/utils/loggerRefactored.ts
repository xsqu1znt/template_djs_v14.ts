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
        .replace("::ACM_LOCAL", chalk.bold.gray("[ACM/LOCAL]"))
        .replace("::ACM_GLOBAL", chalk.bold.gray("[ACM/GLOBAL]"))

        .replace("::IMPORTER", chalk.bold.gray("[IMPORTER]"))
        .replace("::IMPORT_EVENT", chalk.bold.gray("[~/EVENT]"))
        .replace("::IMPORT_COMMAND", chalk.bold.gray("[~/COMMAND]"))

        .replace("::COMMAND", chalk.hex(COLORS.COMMAND_NAME).bold("[⚡️COMMAND]"))
        .replace("::EVENT", chalk.hex(COLORS.EVENT_NAME).bold("[⚡️EVENT]"))
        .replace("::MONGO", chalk.hex(COLORS.MONGO).bold("[🥭 MONGO]"));

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
        const _msg = `${chalk.hex(COLORS.EVENT_NAME).bold(event)} ${chalk.italic.gray(`'${path}'`)}`;
        __log(`::IMPORT_EVENT ${enabled ? _msg : chalk.strikethrough(_msg)}`);
    },

    command: (command: string, path: string, type: "PRFX" | "SLSH" | "CTX" | "UI"): void => {
        let prefix = "";
        switch (type) {
            case "PRFX":
                prefix = config.client.PREFIX;
                break;
            case "SLSH":
                prefix = "/";
                break;
            case "CTX":
                prefix = "[ContextMenu] ";
                break;
            case "UI":
                prefix = "[UserInstallable] ";
                break;
        }
        __log(
            `::IMPORT_COMMAND ${chalk.dim(prefix)}${chalk.hex(COLORS.COMMAND_NAME).bold(command)} ${chalk.italic.gray(
                `'${path}'`
            )}`
        );
    }
};

export const event = (event: string, msg: string): void => {
    __log(`::EVENT ${chalk.hex(COLORS.EVENT_NAME).bold(event)} ${msg}`);
};

export const command = (command: string, msg: string, type: "PRFX" | "SLSH" | "CTX" | "UI"): void => {
    let prefix = "";
    switch (type) {
        case "PRFX":
            prefix = config.client.PREFIX;
            break;
        case "SLSH":
            prefix = "/";
            break;
        case "CTX":
            prefix = "[ContextMenu] ";
            break;
        case "UI":
            prefix = "[UserInstallable] ";
            break;
    }
    __log(`::COMMAND ${chalk.dim(prefix)}${chalk.hex(COLORS.COMMAND_NAME).bold(command)} ${msg}`);
};

/* - - - - - { Testing } - - - - - */
function test(): void {
    log("This is a test log.");
    debug("This is a test debug.");
    error("::CLIENT", "This is a test error.", "This is an error message.");
    success("This is a test success.");

    console.log();

    client.starting();
    client.connecting();
    client.online();
    client.ready();

    console.log();

    importer.event("0_setStatus", "./events/ready/0_setStatus.ts", true);
    importer.event("9_botReady", "./events/ready/9_botReady.ts", false);
    importer.command("cookie_PRFX", "./commands/prefix/cookie_PRFX.ts", "PRFX");
    importer.command("cookie_SLSH", "./commands/slash/cookie_SLSH.ts", "SLSH");
    importer.command("avatar_CTX", "./commands/special/contextMenu/avatar_CTX.ts", "CTX");
    importer.command("pick_UI", "./commands/special/userInstallable/pick_UI.ts", "UI");

    console.log();

    event("9_processSlashCommand", "user: '842555247145779211' | guild: '1052726201086656612'");
    event("9_processPrefixCommand", "user: '842555247145779211' | guild: '1052726201086656612'");

    command("cookie", "user: '842555247145779211' | guild: '1052726201086656612'", "PRFX");
    command("cookie", "user: '842555247145779211' | guild: '1052726201086656612'", "SLSH");
    command("avatar", "user: '842555247145779211' | guild: '1052726201086656612'", "CTX");
    command("pick", "user: '842555247145779211' | guild: '1052726201086656612'", "UI");

    console.log();

    log("::ACM_LOCAL ⏳ Registering app commands...");
    log("::ACM_GLOBAL ⏳ Registering app commands...");

    // log("::IMPORTER ⏳ Importing events...");

    // log("::COMMAND '/cookie' is not a command.");

    // log("::EVENT ✅ Successfuly executed event '0_setStatus'.");

    // log("::MONGO Connecting to MongoDB...");
    // log("::MONGO ✅ Successfully connected to MongoDB");
}

test();

export default {};
