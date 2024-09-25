/** @file Reusable functions for using `console.log()`, but in 4k ultra HD retrocolor. */

import { Shard } from "discord.js";
import jt from "@utils/jsTools";
import chalk from "chalk";

import { name as PROJECT } from "@pkgJSON";
import config from "@configs";

const STARTUP_MESSAGES = [
    "Initalizing...",
    "Starting up...",
    "Revving engines...",
    "Brewing a cup of coffee...",
    "Giving the developer a pat on the back..."
];

/* - - - - - { Color Template } - - - - - */
export const colorTemplates = {
    debug: chalk.hex("#C45AB3"),
    log: chalk.hex("#9F7F95"),

    moduleName: chalk.bold.gray,
    eventName: chalk.hex("#9381FF"),
    commandName: chalk.hex("#EFCD1E")
};

/* - - - - - { Shorthand } - - - - - */
const _TIMESTAMP = (): string => `[${new Date().toLocaleTimeString()}]`;

const _CLIENT = (): string => colorTemplates.moduleName("[CLIENT]");
const _ACM_LOCAL = (): string => colorTemplates.moduleName("[ACM/LOCAL]");
const _ACM_GLOBAL = (): string => colorTemplates.moduleName("[ACM/GLOBAL]");

const _IMPORTER = (): string => colorTemplates.moduleName("[IMPORTER]");
const _IMPORT_EVENT = (): string => colorTemplates.moduleName("[IMPORT/EVENT]");
const _IMPORT_COMMAND = (): string => colorTemplates.moduleName("[IMPORT/COMMAND]");

const _COMMAND = (): string => colorTemplates.moduleName("[COMMAND]");
const _EVENT = (): string => colorTemplates.moduleName("[EVENT]");
const _MONGO = (): string => colorTemplates.moduleName("[🥭 MONGO]");

const _DYNAMIC_SHARD = (shards: Shard[]): string =>
    shards?.length ? chalk.gray`(${shards.length === 1 ? "Shard:" : "Shards:"} ${shards.join(", ")})` : "";
const _SHARD_COUNT = (count: number): string => `${count ? chalk.gray(`Shards running: ${count}`) : ""}`;

/* - - - - - { Exports } - - - - - */
function contextFormatter(str: string): string {
    return str
        .replace("$_TIMESTAMP", _TIMESTAMP())

        .replace("$_CLIENT", _CLIENT())
        .replace("$_ACM_LOCAL", _ACM_LOCAL())
        .replace("$_ACM_GLOBAL", _ACM_GLOBAL())

        .replace("$_IMPORTER", _IMPORTER())
        .replace("$_IMPORT_EVENT", _IMPORT_EVENT())
        .replace("$_IMPORT_COMMAND", _IMPORT_COMMAND())

        .replace("$_COMMAND", _COMMAND())
        .replace("$_EVENT", _EVENT())
        .replace("$_MONGO", _MONGO());
}

/* - - - - - { Exports } - - - - - */
export function debug(msg: string): void {
    console.log(contextFormatter(colorTemplates.debug.italic(chalk`${msg}`)));
}

export function error(header: string, msg: string, err: any = ""): void {
    console.error(contextFormatter(chalk`${chalk.bgRed.white("ERROR!")} ${chalk.bold.red(header)} ${msg}`), err);
}

export function log(msg: string): void {
    console.log(contextFormatter(colorTemplates.log.italic(chalk`${msg}`)));
}

export function success(msg: string): void {
    console.log(contextFormatter(chalk.greenBright(chalk`${msg}`)));
}

export const client = {
    initializing: (shards?: Shard[]): void => {
        console.log(
            `$_TIMESTAMP $_CLIENT ⏳ ${chalk.italic(jt.choice(STARTUP_MESSAGES))} $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _TIMESTAMP())
                .replace("$_CLIENT", _CLIENT())
                .replace("$_DYNAMIC_SHARD", _DYNAMIC_SHARD(shards || []))
        );
    },

    conecting: (shards?: Shard[]): void => {
        console.log(
            `$_TIMESTAMP $_CLIENT ⏳ ${chalk.italic("Connecting to Discord...")} $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _TIMESTAMP())
                .replace("$_CLIENT", _CLIENT())
                .replace("$_DYNAMIC_SHARD", _DYNAMIC_SHARD(shards || []))
        );
    },

    online: (shardCount = 0): void => {
        console.log(
            `$_TIMESTAMP $_CLIENT ✅ ${chalk.green("Successfuly connected to Discord!")} $_SHARD_COUNT`
                .replace("$_TIMESTAMP", _TIMESTAMP())
                .replace("$_CLIENT", _CLIENT())
                .replace("$_SHARD_COUNT", _SHARD_COUNT(shardCount))
        );
    },

    ready: (shards?: Shard[]): void => {
        console.log(
            `$_TIMESTAMP ${chalk`{bold {greenBright ${PROJECT}} is up and running!}`} 🎉 $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _TIMESTAMP())
                .replace("$_DYNAMIC_SHARD", _DYNAMIC_SHARD(shards || []))
        );
    }
};

export const importer = {
    eventImport: (name: string, path: string, enabled: boolean): void => {
        console.log(
            `$_TIMESTAMP $IMPORT_EVENT ${
                enabled
                    ? `${colorTemplates.eventName.bold(name)} ${chalk.italic.gray(path)}`
                    : chalk.strikethrough(`${chalk.bold.dim(name)} ${chalk.italic.gray(path)}`)
            }`
                .replace("$_TIMESTAMP", _TIMESTAMP())
                .replace("$IMPORT_EVENT", _IMPORT_EVENT())
        );
    },

    commandImport: (name: string, path: string, type: "PRFX" | "SLSH" | "CTX" | "UI"): void => {
        let prefix = "";

        // prettier-ignore
        switch (type) {
            case "PRFX": prefix = config.client.PREFIX; break;
            case "SLSH": prefix = "/"; break;
            case "CTX": prefix = "[ContextMenu] "; break;
            case "UI": prefix = "[UserInstallable] "; break;
        }

        // prettier-ignore
        console.log(
            `$_TIMESTAMP $IMPORT_COMMAND ${colorTemplates.commandName.bold(`${chalk.gray(prefix)}${name}`)} ${chalk.italic.gray(path)}`
                .replace("$_TIMESTAMP", _TIMESTAMP())
                .replace("$IMPORT_COMMAND", _IMPORT_COMMAND())
        );
    }
};

export default {
    debug,
    error,
    log,
    success,

    client,
    importer
};
