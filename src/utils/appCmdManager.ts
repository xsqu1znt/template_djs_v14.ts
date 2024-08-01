/** @file Push or remove slash commands to/from guilds. */

import { InteractionCommand, SlashCommand } from "@customTypes/commands";

type RegisterableCommand = SlashCommand | InteractionCommand;

import { Client, Guild, REST, Routes } from "discord.js";
import logger from "./logger";

import { TOKEN } from "@constants";

// Create an instance of the REST API
const rest = new REST().setToken(TOKEN);

async function registerToLocal(client: Client, guildIDs: string[], commands?: RegisterableCommand[]): Promise<void> {
    // If no commands are provided, use all public and interaction commands from the client
    commands = commands?.length
        ? commands
        : [...client.commands.slash.public.values(), ...client.commands.interaction.all.values()];

    /* error */
    if (!commands.length) {
        return logger.error("$_TIMESTAMP $_CMD_MNGR_LOCAL", "No commands found to register");
    }

    // Fetch the guilds from the client using the provided guild IDs
    let guilds = (await Promise.all(guildIDs.map(id => client.guilds.fetch(id).catch(() => null))))
        // Filter out falsey values
        .filter(Boolean) as Guild[];

    /* error */
    if (!guilds.length) {
        return logger.error(
            "$_TIMESTAMP $_CMD_MNGR_LOCAL",
            "Failed to register app commands",
            "No guilds found with the provided IDs"
        );
    }

    /* - - - - - - { Register } - - - - -  */
    let command_data = commands.map(cmd =>
        cmd.builder ? (cmd as SlashCommand).builder.toJSON() : (cmd as InteractionCommand).raw
    );

    logger.log("$_TIMESTAMP $_CMD_MNGR_LOCAL ⏳ Registering app commands...");

    // Iterate through each guild ID and register the commands
    return await Promise.all(
        guilds.map(({ id }) =>
            // Rest API request
            rest
                .put(Routes.applicationGuildCommands(client.user?.id || "", id), { body: command_data })
                .then(() => logger.log(`$_TIMESTAMP $_CMD_MNGR_LOCAL Registered to guild ('${id}')`))
                .catch(err => {
                    logger.error("$_TIMESTAMP $_CMD_MNGR_LOCAL", `Failed to register app commands to guild ('${id}')`, err);
                    return null;
                })
        )
    ).then(resolved => {
        let successful = resolved.filter(Boolean).length;
        // Log the number of guilds that were successfully registered
        logger.log(
            `$_TIMESTAMP $_CMD_MNGR_LOCAL ✅ Registered app commands for ${successful} ${
                successful === 1 ? "guild" : "guilds"
            }`
        );
    });
}

async function removeFromLocal(client: Client, guildIDs: string[]): Promise<void> {
    // Fetch the guilds from the client using the provided guild IDs
    let guilds = (await Promise.all(guildIDs.map(id => client.guilds.fetch(id).catch(() => null))))
        // Filter out falsey values
        .filter(Boolean) as Guild[];

    /* error */
    if (!guilds.length) {
        return logger.error(
            "$_TIMESTAMP $_CMD_MNGR_LOCAL",
            "Failed to register app commands",
            "No guilds found with the provided IDs"
        );
    }

    /* - - - - - - { Remove } - - - - -  */
    logger.log("$_TIMESTAMP $_CMD_MNGR_LOCAL ⏳ Removing app commands...");

    // Iterate through each guild ID and register the commands
    return await Promise.all(
        guilds.map(({ id }) =>
            // Rest API request
            rest
                .put(Routes.applicationGuildCommands(client.user?.id || "", id), { body: [] })
                .then(() => logger.log(`$_TIMESTAMP $_CMD_MNGR_LOCAL Successfully removed from guild ('${id}')`))
                .catch(err => {
                    logger.error("$_TIMESTAMP $_CMD_MNGR_LOCAL", `Failed to remove app commands from guild ('${id}')`, err);
                    return null;
                })
        )
    ).then(resolved => {
        let successful = resolved.filter(Boolean).length;
        // Log the number of guilds that we've successfully removed the commands from
        logger.log(
            `$_TIMESTAMP $_CMD_MNGR_LOCAL ✅ Removed app commands for ${successful} ${successful === 1 ? "guild" : "guilds"}`
        );
    });
}

async function registerToGlobal(client: Client, commands?: RegisterableCommand[]): Promise<void> {
    // If no commands are provided, use all public and interaction commands from the client
    commands ||= [...client.commands.slash.public.values(), ...client.commands.interaction.all.values()];

    /* error */
    if (!commands.length) {
        return logger.error("$_TIMESTAMP $_CMD_MNGR_GLOBAL", "No commands found to register");
    }

    /* - - - - - - { Register } - - - - -  */
    let command_data = commands.map(cmd =>
        cmd.builder ? (cmd as SlashCommand).builder.toJSON() : (cmd as InteractionCommand).raw
    );

    logger.log("$_TIMESTAMP $_CMD_MNGR_GLOBAL ⏳ Registering app commands...");

    // Rest API request
    return await rest
        .put(Routes.applicationCommands(client.user?.id || ""), { body: command_data })
        .then(() => logger.log("$_TIMESTAMP $_CMD_MNGR_GLOBAL ✅ Registered app commands"))
        .catch(err => logger.error("$_TIMESTAMP $_CMD_MNGR_GLOBAL", "Failed to register app commands", err));
}

async function removeFromGlobal(client: Client): Promise<void> {
    logger.log("$_TIMESTAMP $_CMD_MNGR_GLOBAL ⏳ Removing app commands...");

    // Rest API request
    return await rest
        .put(Routes.applicationCommands(client.user?.id || ""), { body: [] })
        .then(() => logger.log("$_TIMESTAMP $_CMD_MNGR_GLOBAL ✅ Removed app commands"))
        .catch(err => logger.error("$_TIMESTAMP $_CMD_MNGR_GLOBAL", "Failed to remove app commands", err));
}

export default { registerToLocal, removeFromLocal, registerToGlobal, removeFromGlobal };
