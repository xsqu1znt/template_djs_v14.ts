import { ContextMenuCommand, PrefixCommand, SlashCommand, UserInstallableCommand } from "@customTypes/commands";

import { Client, Collection, SlashCommandBuilder } from "discord.js";

declare module "discord.js" {
    interface Client {
        /** The name of the client. Currently used for logging. */
        __name: string;

        /** The client's commands. */
        commands: {
            /** Slash commands. **`/cookie`** */
            slash: {
                all: Collection<string, SlashCommand>;
                public: Collection<string, SlashCommand>;
                staff: Collection<string, SlashCommand>;
                custom: Collection<string, SlashCommand>;
            };

            /** Prefix commands. **`!cookie`** */
            prefix: {
                all: Collection<string, PrefixCommand>;
                public: Collection<string, PrefixCommand>;
                staff: Collection<string, PrefixCommand>;
                custom: Collection<string, PrefixCommand>;
            };

            /** Special commands. **`Context Menu`** | **`User Installable`** */
            special: {
                all: Collection<string, ContextMenuCommand | UserInstallableCommand>;
                contextMenu: Collection<string, ContextMenuCommand>;
                userInstallable: Collection<string, UserInstallableCommand>;
            };
        };
    }
}
