import { ContextMenuCommand, PrefixCommand, SlashCommand, UserInstallableCommand } from "@customTypes/commands";

import { Client, Collection, SlashCommandBuilder } from "discord.js";

declare module "discord.js" {
    interface Client {
        commands: {
            slash: {
                all: Collection<string, SlashCommand>;
                public: Collection<string, SlashCommand>;
                staff: Collection<string, SlashCommand>;
                custom: Collection<string, SlashCommand>;
            };

            prefix: {
                all: Collection<string, PrefixCommand>;
                public: Collection<string, PrefixCommand>;
                staff: Collection<string, PrefixCommand>;
                custom: Collection<string, PrefixCommand>;
            };

            special: {
                all: Collection<string, ContextMenuCommand | UserInstallableCommand>;
                contextMenu: Collection<string, ContextMenuCommand>;
                userInstallable: Collection<string, UserInstallableCommand>;
            };
        };
    }
}
