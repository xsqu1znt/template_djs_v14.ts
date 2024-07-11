import { PrefixCommand, RawCommand } from "@customTypes/commands";

import { Client, Collection, SlashCommandBuilder } from "discord.js";

declare module "discord.js" {
    interface Client {
        slashCommands: {
            all: Collection<string, SlashCommandBuilder | RawCommand>;
            public: Collection<string, SlashCommandBuilder>;
            staff: Collection<string, SlashCommandBuilder>;
            userInstall: Collection<string, RawCommand>;
            custom: Collection<string, SlashCommandBuilder>;
        };

        prefixCommands: {
            all: Collection<string, PrefixCommand | RawCommand>;
            public: Collection<string, PrefixCommand | RawCommand>;
            staff: Collection<string, PrefixCommand | RawCommand>;
            custom: Collection<string, PrefixCommand | RawCommand>;
        };
    }
}
