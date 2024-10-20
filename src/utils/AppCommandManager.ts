/** @file Push or remove slash commands to/from guilds. */

import { ContextMenuCommand, SlashCommand, UserInstallableCommand } from "@customTypes/commands";

type RegisterableCommand = SlashCommand | ContextMenuCommand | UserInstallableCommand;

import { Client, ContextMenuCommandBuilder, Guild, REST, Routes, SlashCommandBuilder } from "discord.js";
import logger from "./logger";

export default class AppCommandManager {
    rest: REST;

    constructor(public client: Client) {
        // Create an instance of the REST API
        this.rest = new REST().setToken(client.token as string);
    }

    static isSlashCommand(cmd: any): cmd is SlashCommand {
        return "builder" in cmd && !("type" in cmd) && cmd.builder instanceof SlashCommandBuilder;
    }

    static isContextMenuCommand(cmd: any): cmd is ContextMenuCommand {
        return "builder" in cmd && cmd.builder instanceof ContextMenuCommandBuilder;
    }

    static isUserInstallCommand(cmd: any): cmd is UserInstallableCommand {
        return "type" in cmd && "integration_types" in cmd && "contexts" in cmd;
    }

    /** Register app commands to one or more specific servers.
     *
     * ___NOTE:___ This ___does not___ add `UserInstall` commands to user accounts. */
    async registerToLocal(guildIds: string[], commands?: RegisterableCommand[]): Promise<void> {
        // If no commands are provided, use all public and interaction commands from the client
        commands = commands?.length
            ? commands
            : [...this.client.commands.slash.public.values(), ...this.client.commands.special.all.values()];

        /* error */
        if (!commands.length) {
            return logger.error("::ACM_LOCAL", "No commands found to register");
        }

        // Fetch the guilds from the client using the provided guild IDs
        let guilds = (await Promise.all(guildIds.map(id => this.client.guilds.fetch(id).catch(null))))
            // Filter out falsey values
            .filter(Boolean) as Guild[];

        /* error */
        if (!guilds.length) {
            return logger.error("::ACM_LOCAL", "Failed to register app commands", "No guilds found with the provided IDs");
        }

        /* - - - - - - { Register } - - - - -  */
        let command_data = commands.map(cmd => {
            if (AppCommandManager.isSlashCommand(cmd)) {
                return cmd.builder.toJSON();
            } else if (AppCommandManager.isContextMenuCommand(cmd)) {
                return cmd.builder.toJSON();
            } else if (AppCommandManager.isUserInstallCommand(cmd)) {
                return {
                    ...cmd.builder.toJSON(),
                    type: cmd.type,
                    integration_types: cmd.integration_types,
                    contexts: cmd.contexts
                };
            } else {
                throw new TypeError("Unknown interaction command type", { cause: cmd });
            }
        });

        logger.log("::ACM_LOCAL ⏳ Registering app commands...");

        // Iterate through each guild ID and register the commands
        return await Promise.all(
            guilds.map(({ id }) =>
                // Rest API request
                this.rest
                    .put(Routes.applicationGuildCommands(this.client.user?.id || "", id), { body: command_data })
                    .then(() => {
                        logger.success(`::ACM_LOCAL Registered to guild ('${id}')`);
                        return true;
                    })
                    .catch(err => {
                        logger.error("::ACM_LOCAL", `Failed to register app commands to guild ('${id}')`, err);
                        return null;
                    })
            )
        ).then(resolved => {
            let successful = resolved.filter(Boolean).length;
            // Log the number of guilds that were successfully registered
            logger.success(
                `::ACM_LOCAL ✅ Registered app commands for ${successful} ${successful === 1 ? "guild" : "guilds"}`
            );
        });
    }

    /** Remove app commands from one or more specific servers.
     *
     * ___NOTE:___ This has no effect on app commands registered with `registerToGlobal`. */
    async removeFromLocal(guildIds: string[]): Promise<void> {
        // Fetch the guilds from the client using the provided guild IDs
        let guilds = (await Promise.all(guildIds.map(id => this.client.guilds.fetch(id).catch(null))))
            // Filter out falsey values
            .filter(Boolean) as Guild[];

        /* error */
        if (!guilds.length) {
            return logger.error("::ACM_LOCAL", "Failed to register app commands", "No guilds found with the provided IDs");
        }

        /* - - - - - - { Remove } - - - - -  */
        logger.log("::ACM_LOCAL ⏳ Removing app commands...");

        // Iterate through each guild ID and register the commands
        return await Promise.all(
            guilds.map(({ id }) =>
                // Rest API request
                this.rest
                    .put(Routes.applicationGuildCommands(this.client.user?.id || "", id), { body: [] })
                    .then(() => {
                        logger.success(`::ACM_LOCAL Successfully removed from guild ('${id}')`);
                        return true;
                    })
                    .catch(err => {
                        logger.error("::ACM_LOCAL", `Failed to remove app commands from guild ('${id}')`, err);
                        return null;
                    })
            )
        ).then(resolved => {
            let successful = resolved.filter(Boolean).length;
            // Log the number of guilds that we've successfully removed the commands from
            logger.success(`::ACM_LOCAL ✅ Removed app commands for ${successful} ${successful === 1 ? "guild" : "guilds"}`);
        });
    }

    /** Register app commands to the bot's account data.
     *
     * This allows Discord to know what commands the bot has and removes the need to register commands to new servers.
     *
     * ___NOTE:___ This also adds `UserInstall` commands to user accounts. */
    async registerToGlobal(commands?: RegisterableCommand[]): Promise<void> {
        // If no commands are provided, use all public and interaction commands from the client
        commands ||= [...this.client.commands.slash.public.values(), ...this.client.commands.special.all.values()];

        /* error */
        if (!commands.length) {
            return logger.error("::ACM_GLOBAL", "No commands found to register");
        }

        let command_data = commands.map(cmd => {
            if (AppCommandManager.isSlashCommand(cmd)) {
                return cmd.builder.toJSON();
            } else if (AppCommandManager.isContextMenuCommand(cmd)) {
                return cmd.builder.toJSON();
            } else if (AppCommandManager.isUserInstallCommand(cmd)) {
                return {
                    ...cmd.builder.toJSON(),
                    type: cmd.type,
                    integration_types: cmd.integration_types,
                    contexts: cmd.contexts
                };
            } else {
                throw new TypeError("Unknown interaction command type", { cause: cmd });
            }
        });

        logger.log("::ACM_GLOBAL ⏳ Registering app commands...");

        // Rest API request
        return await this.rest
            .put(Routes.applicationCommands(this.client.user?.id || ""), { body: command_data })
            .then(() => logger.success("::ACM_GLOBAL ✅ Registered app commands"))
            .catch(err => logger.error("::ACM_GLOBAL", "Failed to register app commands", err));
    }

    /** Remove app commands from the bot's account data.
     *
     * This also removes `UserInstall` commands from user accounts.
     *
     * ___NOTE:___ This has no effect on app commands registered with `registerToLocal`. */
    async removeFromGlobal(): Promise<void> {
        logger.log("::ACM_GLOBAL ⏳ Removing app commands...");

        // Rest API request
        return await this.rest
            .put(Routes.applicationCommands(this.client.user?.id || ""), { body: [] })
            .then(() => logger.success("::ACM_GLOBAL ✅ Removed app commands"))
            .catch(err => logger.error("::ACM_GLOBAL", "Failed to remove app commands", err));
    }
}
