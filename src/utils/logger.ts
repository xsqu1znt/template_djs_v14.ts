/** @file Reusable functions for using `console.log()`, but in 4k ultra HD retrocolor. */

import jt from "@utils/jsTools";
import chalk from "chalk";

import { name as PROJECT } from "@pkgJSON";
import config from "@configs";

const { COLORS } = config.logger;

function __format(str: string, colored: boolean = true): string {
    const { LOG_TIMESTAMPS } = config.logger;

    str = str
        .replace("::TIMESTAMP ", LOG_TIMESTAMPS ? `[${new Date().toLocaleTimeString()}] ` : "")

        .replace("::CLIENT", colored ? chalk.bold.gray("[CLIENT]") : "[CLIENT]")
        .replace("::ACM_LOCAL", colored ? chalk.bold.dim("[ACM/LOCAL]") : "[ACM/LOCAL]")
        .replace("::ACM_GLOBAL", colored ? chalk.bold.dim("[ACM/GLOBAL]") : "[ACM/GLOBAL]")

        .replace("::IMPORTER", colored ? chalk.bold.dim("[IMPORTER]") : "[IMPORTER]")
        .replace("::IMPORT_EVENT", colored ? chalk.bold.gray("[~/EVENT]") : "[~/EVENT]")
        .replace("::IMPORT_COMMAND", colored ? chalk.bold.gray("[~/COMMAND]") : "[~/COMMAND]")

        .replace("::COMMAND", colored ? chalk.hex(COLORS.COMMAND_NAME).bold("[⚡️COMMAND]") : "[⚡️COMMAND]")
        .replace("::EVENT", colored ? chalk.hex(COLORS.EVENT_NAME).bold("[⚡️EVENT]") : "[⚡️EVENT]")
        .replace("::MONGO", colored ? chalk.hex(COLORS.MONGO).bold("[🥭 MONGO]") : "[🥭 MONGO]");

    return chalk`${str}`;
}

function __log(msg: string, format: boolean = true): void {
    const timestamp = __format("::TIMESTAMP ");
    console.log(`${timestamp}${format ? __format(`${msg}`) : `${msg}`}`);
}

function __error(msg: string, err: any, format: boolean = true): void {
    const timestamp = __format("::TIMESTAMP ");
    console.error(`${timestamp}${format ? __format(`${msg}`) : `${msg}`}`, err);
}

/* - - - - - { Base } - - - - - */
export function log(msg: string, format: boolean = true): void {
    __log(chalk.gray(msg), format);
}

export function debug(msg: string, format: boolean = true): void {
    __log(chalk.hex(COLORS.DEBUG)(msg), format);
}

export function error(header: string, msg: string, err: any = "", format: boolean = true): void {
    __error(`${chalk.bgRed("ERROR!")} ${chalk.bold.red(__format(header, false))} ${msg}`, err, format);
}

export function success(msg: string, format: boolean = true): void {
    __log(chalk.greenBright(msg), format);
}

/* - - - - - { Client } - - - - - */
export const client = {
    starting: (): void => __log(`::CLIENT ⏳ ${chalk.italic(jt.choice(config.logger.STARTUP_MESSAGES))}`),
    connecting: (): void => __log(`::CLIENT ⏳ ${chalk.italic("Connecting to Discord...")}`),
    online: (): void => __log(`::CLIENT ✅ ${chalk.greenBright("Successfuly connected to Discord!")}`),
    ready: () => __log(`::CLIENT ✅ ${chalk.greenBright(`${chalk.bold.underline(PROJECT)} is up and running!`)} 🎉`)
};

/* - - - - - { utils/importers } - - - - - */
export const importer = {
    event: (event: string, path: string, enabled: boolean): void => {
        const _msg = `${chalk.hex(COLORS.EVENT_NAME).bold(event)} ${chalk.italic.gray(`'${path}'`)}`;
        __log(`::IMPORT_EVENT ${chalk.bold("✔️ IMPORTED")} | ${enabled ? _msg : chalk.strikethrough(_msg)}`);
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
            `::IMPORT_COMMAND ${chalk.bold("✔️ IMPORTED")} | ${chalk.dim(prefix)}${chalk
                .hex(COLORS.COMMAND_NAME)
                .bold(command)} ${chalk.italic.gray(`'${path}'`)}`
        );
    }
};

export const event = (event: string, msg: string): void => {
    __log(`::EVENT ${chalk.hex(COLORS.EVENT_NAME).bold(event)} | ${msg}`);
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
    __log(`::COMMAND ${chalk.dim(prefix)}${chalk.hex(COLORS.COMMAND_NAME).bold(command)} | ${msg}`);
};

/* - - - - - { Test } - - - - - */
export function test(): void {
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

    log(
        "Log Headers ::CLIENT ::ACM_LOCAL ::ACM_GLOBAL ::IMPORTER ::IMPORT_EVENT ::IMPORT_COMMAND ::COMMAND ::EVENT ::MONGO"
    );

    log(
        "Log Headers (Raw) ::TIMESTAMP ::CLIENT ::ACM_LOCAL ::ACM_GLOBAL ::IMPORTER ::IMPORT_EVENT ::IMPORT_COMMAND ::COMMAND ::EVENT ::MONGO",
        false
    );
}

export default { log, debug, error, success, client, importer, event, command, test };
