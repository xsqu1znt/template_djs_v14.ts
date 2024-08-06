import {
    BaseInteractionCommand,
    ContextMenuCommand,
    PrefixCommand,
    SlashCommand,
    UserInstallCommand
} from "@customTypes/commands";

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

            interaction: {
                all: Collection<string, ContextMenuCommand | UserInstallCommand>;
                contextMenu: Collection<string, ContextMenuCommand>;
                userInstall: Collection<string, UserInstallCommand>;
            };
        };
    }
}
