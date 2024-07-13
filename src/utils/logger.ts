/** @file Reusable functions for using `console.log()`, but in 4k ultra HD retrocolor. */

import { Shard } from "discord.js";
import chalk from "chalk";

import { name as PROJECT } from "@pkgJSON";

/* - - - - - { Shorthand } - - - - - */
const _timestamp = () => chalk.bold(`[${new Date().toLocaleTimeString()}]`);
const _client = () => chalk.bold.gray("[CLIENT]");

const _dynamic_shard = (shards: Shard[]) =>
    `${shards?.length ? chalk.gray(`(${shards.length === 1 ? "Shard:" : "Shard:"} ${shards.join(", ")})`) : ""}`;
const _shard_count = (count: number) => `${count ? chalk.gray(`Shards running: ${count}`) : ""}`;

/* - - - - - { Function Groups } - - - - - */
export const client = {
    // prettier-ignore
    initializing: function (shards?: Shard[]) {
        console.log(`${_timestamp()} ${_client()} ⏳ ${chalk`{italic Initalizing...} ${_dynamic_shard(shards || [])}`}`);
    },

    // prettier-ignore
    conecting: function (shards?: Shard[]) {
        console.log(`${_timestamp()} ${_client()} ⏳ ${chalk`{italic Connecting to Discord...} ${_dynamic_shard(shards || [])}`}`);
    },

    // prettier-ignore
    online: function (shardCount = 0) {
        console.log(`${_timestamp()} ${_client()} ✅ ${chalk`{italic {green Successfuly connected to Discord!}} ${_shard_count(shardCount)}`}`);
    },

    // prettier-ignore
    ready: function (shards?: Shard[]) {
        console.log(`${_timestamp()} 🎉 ${chalk.blueBright(PROJECT)} is up and running! ${_dynamic_shard(shards || [])}`);
    }
};

export function debug(msg: string): void {
    console.log(chalk.magenta(msg));
}

export function error(header: string, msg: string, err: any = ""): void {
    console.error(chalk.black.bgRed(header) + " " + chalk.magenta(msg), err);
}

export function log(msg: string): void {
    console.log(chalk.gray(msg));
}

export function success(msg: string): void {
    console.log(chalk.green(msg));
}
