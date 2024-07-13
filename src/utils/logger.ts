/** @file Reusable functions for using `console.log()`, but in 4k ultra HD retrocolor. */

import { Shard } from "discord.js";
import chalk from "chalk";

import { name as PROJECT } from "@pkgJSON";

/* - - - - - { Shorthand } - - - - - */
const _client = (): string => chalk.bold.gray("[CLIENT]");
const _event = (): string => chalk.bold.yellow("[EVENT]");

const _timestamp = (): string => chalk.bold(`[${new Date().toLocaleTimeString()}]`);

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
            `$_TIMESTAMP $_CLIENT ⏳ ${chalk.italic("Initalizing...")} $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_CLIENT", _client())
                .replace("_$DYNAMIC_SHARD", _dynamic_shard(shards || []))
        );
    },

    conecting: (shards?: Shard[]): void => {
        console.log(
            `$_TIMESTAMP $_CLIENT ⏳ ${chalk.italic("Connecting to Discord...")} $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_CLIENT", _client())
                .replace("_$DYNAMIC_SHARD", _dynamic_shard(shards || []))
        );
    },

    online: (shardCount = 0): void => {
        console.log(
            `$_TIMESTAMP $_CLIENT ✅ ${chalk.italic.green("Successfuly connected to Discord!")} $_SHARD_COUNT`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_CLIENT", _client())
                .replace("$_SHARD_COUNT", _shard_count(shardCount))
        );
    },

    // prettier-ignore
    ready: (shards?: Shard[]): void => {
        console.log(
            `$_TIMESTAMP 🎉 ${chalk.blueBright(PROJECT)} is up and running! $_DYNAMIC_SHARD`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("_$DYNAMIC_SHARD", _dynamic_shard(shards || []))
        );
    },

    eventBinded: (name: string, path: string, enabled: boolean = false): void => {
        console.log(
            `$_TIMESTAMP $_EVENT ${enabled ? "Loaded" : chalk.bgRed("Ignored")}: ${chalk.bold(name)} | Path: ${chalk.bgGray.white(path)}`
                .replace("$_TIMESTAMP", _timestamp())
                .replace("$_CLIENT", _client())
        );
    }
};
