/** @file Reusable functions for using `console.log()`, but in 4k ultra HD retrocolor. */

import { Shard } from "discord.js";
import * as jt from "@utils/jsTools";
import chalk from "chalk";

import { name as PROJECT } from "@pkgJSON";
import * as config from "@configs";

const STARTUP_MESSAGES = [
    "Initalizing...",
    "Starting up...",
    "Revving engines...",
    "Brewing a cup of coffee...",
    "Giving the developer a pat on the back..."
];

/* - - - - - { Shorthand } - - - - - */
const _client = (): string => chalk.bold.gray("[CLIENT]");
const _event = (): string => chalk.bold.gray("[EVENT]");
const _command = (): string => chalk.bold.gray("[COMMAND]");

const _timestamp = (): string => chalk(`[${new Date().toLocaleTimeString()}]`);

const _dynamic_shard = (shards: Shard[]): string =>
    shards?.length ? chalk.gray`(${shards.length === 1 ? "Shard:" : "Shards:"} ${shards.join(", ")})` : "";
const _shard_count = (count: number): string => `${count ? chalk.gray(`Shards running: ${count}`) : ""}`;

/* - - - - - { Exports } - - - - - */
export function debug(msg: string): void {
    console.log(chalk.magenta(msg));
}

export function error(header: string, msg: string, err: any = ""): void {
    console.error(`${chalk.bgRed.black(header)} ${chalk.magenta(msg)}`, err);
}

export function log(msg: string): void {
    console.log(chalk.gray(msg));
}

export function success(msg: string): void {
    console.log(chalk.green(msg));
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
            `$_TIMESTAMP ${chalk`{bold {blueBright ${PROJECT}} is up and running!}`} 🎉 $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_DYNAMIC_SHARD", _dynamic_shard(shards || []))
        );
    },

    eventBinded: (name: string, path: string, enabled: boolean): void => {
        console.log(
            `$_TIMESTAMP $_EVENT ${
                enabled
                    ? `${chalk.bold.yellow(name)} ${chalk.italic.gray(path)}`
                    : chalk.strikethrough(`${chalk.dim(name)} ${chalk.italic.gray(path)}`)
            }`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_EVENT", _event())
        );
    },

    commandLoaded: (name: string, path: string, type: "prefix" | "slash"): void => {
        let prefix = "";

        // prettier-ignore
        switch (type) {
            case "prefix": prefix = config.client.PREFIX; break;
            case "slash": prefix = "/"; break;
        }

        console.log(
            `$_TIMESTAMP $_COMMAND ${chalk.bold.yellow(`${prefix}${name}`)} ${chalk.italic.gray(path)}`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_COMMAND", _command())
        );
    }
};
