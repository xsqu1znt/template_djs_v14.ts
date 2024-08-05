/** @file Push or remove slash commands to/from guilds. */

import { BaseInteractionCommand, ContextMenuCommand, SlashCommand, UserInstallCommand } from "@customTypes/commands";

type RegisterableCommand = SlashCommand | BaseInteractionCommand;

import { Client, Guild, REST, Routes } from "discord.js";
import logger from "./logger";

import { TOKEN } from "@constants";

// Create an instance of the REST API
const rest = new REST().setToken(TOKEN);

export default class AppCommandManager {
    constructor(public client: Client) {}

    /** Register app commands to one or more specific servers.
     *
     * __NOTE__: This ___does not___ add `UserInstall` commands to user accounts. */
    async registerToLocal(guildIDs: string[], commands?: RegisterableCommand[]): Promise<void> {
        // If no commands are provided, use all public and interaction commands from the client
        commands = commands?.length
            ? commands
            : [...this.client.commands.slash.public.values(), ...this.client.commands.interaction.all.values()];
        
        /* error */
        if (!commands.length) {
            return logger.error("$_TIMESTAMP $_ACM_LOCAL", "No commands found to register");
        }

        // Fetch the guilds from the client using the provided guild IDs
        let guilds = (await Promise.all(guildIDs.map(id => this.client.guilds.fetch(id).catch(() => null))))
            // Filter out falsey values
            .filter(Boolean) as Guild[];

        /* error */
        if (!guilds.length) {
            return logger.error(
                "$_TIMESTAMP $_ACM_LOCAL",
                "Failed to register app commands",
                "No guilds found with the provided IDs"
            );
        }

        /* - - - - - - { Register } - - - - -  */
        let command_data = commands.map(cmd =>
            cmd.builder ? (cmd as SlashCommand | ContextMenuCommand).builder.toJSON() : (cmd as UserInstallCommand).raw
        );

        logger.log("$_TIMESTAMP $_ACM_LOCAL ⏳ Registering app commands...");

        // Iterate through each guild ID and register the commands
        return await Promise.all(
            guilds.map(({ id }) =>
                // Rest API request
                rest
                    .put(Routes.applicationGuildCommands(this.client.user?.id || "", id), { body: command_data })
                    .then(() => {
                        logger.log(`$_TIMESTAMP $_ACM_LOCAL Registered to guild ('${id}')`);
                        return true;
                    })
                    .catch(err => {
                        logger.error(
                            "$_TIMESTAMP $_ACM_LOCAL",
                            `Failed to register app commands to guild ('${id}')`,
                            err
                        );
                        return null;
                    })
            )
        ).then(resolved => {
            let successful = resolved.filter(Boolean).length;
            // Log the number of guilds that were successfully registered
            logger.log(
                `$_TIMESTAMP $_ACM_LOCAL ✅ Registered app commands for ${successful} ${
                    successful === 1 ? "guild" : "guilds"
                }`
            );
        });
    }

    /** Remove app commands from one or more specific servers.
     *
     * __NOTE__: This has no effect on app commands registered with `registerToGlobal`. */
    async removeFromLocal(guildIDs: string[]): Promise<void> {
        // Fetch the guilds from the client using the provided guild IDs
        let guilds = (await Promise.all(guildIDs.map(id => this.client.guilds.fetch(id).catch(() => null))))
            // Filter out falsey values
            .filter(Boolean) as Guild[];

        /* error */
        if (!guilds.length) {
            return logger.error(
                "$_TIMESTAMP $_ACM_LOCAL",
                "Failed to register app commands",
                "No guilds found with the provided IDs"
            );
        }

        /* - - - - - - { Remove } - - - - -  */
        logger.log("$_TIMESTAMP $_ACM_LOCAL ⏳ Removing app commands...");

        // Iterate through each guild ID and register the commands
        return await Promise.all(
            guilds.map(({ id }) =>
                // Rest API request
                rest
                    .put(Routes.applicationGuildCommands(this.client.user?.id || "", id), { body: [] })
                    .then(() => {
                        logger.log(`$_TIMESTAMP $_ACM_LOCAL Successfully removed from guild ('${id}')`);
                        return true;
                    })
                    .catch(err => {
                        logger.error(
                            "$_TIMESTAMP $_ACM_LOCAL",
                            `Failed to remove app commands from guild ('${id}')`,
                            err
                        );
                        return null;
                    })
            )
        ).then(resolved => {
            let successful = resolved.filter(Boolean).length;
            // Log the number of guilds that we've successfully removed the commands from
            logger.log(
                `$_TIMESTAMP $_ACM_LOCAL ✅ Removed app commands for ${successful} ${
                    successful === 1 ? "guild" : "guilds"
                }`
            );
        });
    }

    /** Register app commands to the bot's account data.
     *
     * This allows Discord to know what commands the bot has and removes the need to register commands to new servers.
     *
     * __NOTE__: This also adds `UserInstall` commands to user accounts. */
    async registerToGlobal(commands?: RegisterableCommand[]): Promise<void> {
        // If no commands are provided, use all public and interaction commands from the client
        commands ||= [...this.client.commands.slash.public.values(), ...this.client.commands.interaction.all.values()];

        /* error */
        if (!commands.length) {
            return logger.error("$_TIMESTAMP $_ACM_GLOBAL", "No commands found to register");
        }

        /* - - - - - - { Register } - - - - -  */
        let command_data = commands.map(cmd =>
            cmd.builder ? (cmd as SlashCommand | ContextMenuCommand).builder.toJSON() : (cmd as UserInstallCommand).raw
        );

        logger.log("$_TIMESTAMP $_ACM_GLOBAL ⏳ Registering app commands...");

        // Rest API request
        return await rest
            .put(Routes.applicationCommands(this.client.user?.id || ""), { body: command_data })
            .then(() => logger.log("$_TIMESTAMP $_ACM_GLOBAL ✅ Registered app commands"))
            .catch(err => logger.error("$_TIMESTAMP $_ACM_GLOBAL", "Failed to register app commands", err));
    }

    /** Remove app commands from the bot's account data.
     *
     * This also removes `UserInstall` commands from user accounts.
     *
     * __NOTE__: This has no effect on app commands registered with `registerToLocal`. */
    async removeFromGlobal(): Promise<void> {
        logger.log("$_TIMESTAMP $_ACM_GLOBAL ⏳ Removing app commands...");

        // Rest API request
        return await rest
            .put(Routes.applicationCommands(this.client.user?.id || ""), { body: [] })
            .then(() => logger.log("$_TIMESTAMP $_ACM_GLOBAL ✅ Removed app commands"))
            .catch(err => logger.error("$_TIMESTAMP $_ACM_GLOBAL", "Failed to remove app commands", err));
    }
}
