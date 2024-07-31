/** @file Push or remove slash commands to/from guilds. */

import { InteractionCommand, SlashCommand } from "@customTypes/commands";

interface PushOptions {
    /** Specifc commands to push. */
    commands?: Array<SlashCommand | InteractionCommand>;
    /** Whether commands should register globally. */
    global?: boolean;
}

import { Client, REST } from "discord.js";
import logger from "./logger";
import jt from "./jsTools";

import config from "@configs";

import { TOKEN } from "@index";

// Create an instance of the REST API
const rest = new REST().setToken(TOKEN);

export default {
    push: async (client: Client, guildIDs: string | string[], options?: PushOptions) => {
        let guildsToPushTo = jt.forceArray(guildIDs);
        let global = options?.global ?? false;
        let commands = options?.commands?.length
            ? options.commands
            : [...client.commands.slash.public.values(), ...client.commands.interaction.all.values()];

        if (!commands.length) {
            return logger.error(
                "$_TIMESTAMP $_CLIENT",
                "Failed to register application commands (/)",
                `No commands found! | op: ${global ? "GLOBAL" : "LOCAL"}`
            );
        }
    }
};
