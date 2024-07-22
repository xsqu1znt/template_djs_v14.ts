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
export const colors = {
    debug: chalk.hex("#C45AB3"),
    log: chalk.hex("#9F7F95"),

    eventName: chalk.hex("#9381FF"),
    commandName: chalk.hex("#EFCD1E")
};

/* - - - - - { Shorthand } - - - - - */
const _client = (): string => chalk.bold.gray("[CLIENT]");
const _importer = (): string => chalk.bold.gray("[IMPORTER]");
const _import_event = (): string => chalk.bold.gray("[IMPORT/EVENT]");
const _import_command = (): string => chalk.bold.gray("[IMPORT/COMMAND]");
const _command = (): string => chalk.bold.gray("[COMMAND]");

const _timestamp = (): string => `[${new Date().toLocaleTimeString()}]`;

const _dynamic_shard = (shards: Shard[]): string =>
    shards?.length ? chalk.gray`(${shards.length === 1 ? "Shard:" : "Shards:"} ${shards.join(", ")})` : "";
const _shard_count = (count: number): string => `${count ? chalk.gray(`Shards running: ${count}`) : ""}`;

/* - - - - - { Exports } - - - - - */
function contextFormatter(str: string): string {
    return str
        .replace("$_TIMESTAMP", _timestamp())
        .replace("$_CLIENT", _client())
        .replace("$_IMPORTER", _importer())
        .replace("$_IMPORT_EVENT", _import_event())
        .replace("$_IMPORT_COMMAND", _import_command())
        .replace("$_COMMAND", _command());
}

export function debug(msg: string): void {
    console.log(colors.debug.italic(contextFormatter(msg)));
}

export function error(header: string, msg: string, err: any = ""): void {
    console.error(contextFormatter(`${chalk.bgRed.white("ERROR!")} ${chalk.bold.red(header)} ${msg}`), err);
}

export function log(msg: string): void {
    console.log(colors.log.italic(msg));
}

export function success(msg: string): void {
    console.log(chalk.greenBright(msg));
}

export const client = {
    initializing: (shards?: Shard[]): void => {
        console.log(
            `$_TIMESTAMP $_CLIENT ⏳ ${chalk.italic(jt.choice(STARTUP_MESSAGES))} $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_CLIENT", _client())
                .replace("$_DYNAMIC_SHARD", _dynamic_shard(shards || []))
        );
    },

    conecting: (shards?: Shard[]): void => {
        console.log(
            `$_TIMESTAMP $_CLIENT ⏳ ${chalk.italic("Connecting to Discord...")} $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_CLIENT", _client())
                .replace("$_DYNAMIC_SHARD", _dynamic_shard(shards || []))
        );
    },

    online: (shardCount = 0): void => {
        console.log(
            `$_TIMESTAMP $_CLIENT ✅ ${chalk.green("Successfuly connected to Discord!")} $_SHARD_COUNT`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_CLIENT", _client())
                .replace("$_SHARD_COUNT", _shard_count(shardCount))
        );
    },

    ready: (shards?: Shard[]): void => {
        console.log(
            `$_TIMESTAMP ${chalk`{bold {greenBright ${PROJECT}} is up and running!}`} 🎉 $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_DYNAMIC_SHARD", _dynamic_shard(shards || []))
        );
    }
};

export const importer = {
    eventImport: (name: string, path: string, enabled: boolean): void => {
        console.log(
            `$_TIMESTAMP $IMPORT_EVENT ${
                enabled
                    ? `${colors.eventName.bold(name)} ${chalk.italic.gray(path)}`
                    : chalk.strikethrough(`${chalk.bold.dim(name)} ${chalk.italic.gray(path)}`)
            }`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$IMPORT_EVENT", _import_event())
        );
    },

    commandImport: (name: string, path: string, type: "prefix" | "slash" | "interaction"): void => {
        let prefix = "";

        // prettier-ignore
        switch (type) {
            case "prefix": prefix = config.client.PREFIX; break;
            case "slash": prefix = "/"; break;
            case "interaction": prefix = ""; break;
        }

        console.log(
            `$_TIMESTAMP $IMPORT_COMMAND ${colors.commandName.bold(`${prefix}${name}`)} ${chalk.italic.gray(path)}`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$IMPORT_COMMAND", _import_command())
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
