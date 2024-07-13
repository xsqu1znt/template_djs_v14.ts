import { Client, ClientEvents, CommandInteraction, Message, PermissionFlags, SlashCommandBuilder } from "discord.js";

/* - - - - - { Callback Types } - - - - - */
export interface PrefixCommandCallbackExtraParams {
    /** Message content without the command name. */
    cleanContent: string;
    /** The command's name. */
    cmdName: string;
    /** The prefix used. */
    prefix: string;
}

export type BaseCommandCallback = (client: Client, ...args: any[]) => Promise<Message | void | null>;
export type SlashCommandCallback = (client: Client, interaction: CommandInteraction) => Promise<Message | void | null>;
export type PrefixCommandCallback = (
    client: Client,
    message: Message,
    ...args: PrefixCommandCallbackExtraParams
) => Promise<Message | void | null>;

/* - - - - - { Command Export Types } - - - - - */
export interface BaseCommandOptions {
    /** The emoji to show in the help command list. Can also be a custom emoji.
     *
     * `<:Emoji_Name:Emoji_ID>` - for custom emojis.
     *
     * `<a:Emoji_Name:Emoji_ID>` - for animated custom emojis. */
    emoji?: string;
    /** Only allow this command to be used in guilds. */
    guildOnly?: boolean;
    /** Only allow bot staff to use this command. */
    botAdminOnly?: boolean;
    /** Only allow guild admins to use this command. */
    guildAdminOnly?: boolean;
    /** Require the user to have certain permissions in the current guild. */
    specialBotPerms?: PermissionFlags | PermissionFlags[];
    /** Require the bot to have certain permissions in the current guild. */
    specialUserPerms?: PermissionFlags | PermissionFlags[];
    /** Hide this command from the help command list. */
    hidden?: boolean;
}

export interface SlashCommandOptions extends BaseCommandOptions {
    /** Defer the interaction.
     *
     * ***Required if the Slash Command can take longer than 3 seconds to execute.*** */
    deferReply?: boolean;
}

export interface PrefixCommandOptions extends BaseCommandOptions {}

/* - - - - - { Command Types } - - - - - */
export interface SlashCommand {
    /** The category to place the command inside the help command. */
    category: string;
    /** Extra options for this command. */
    options: SlashCommandOptions;
    /** Slash command builder. */
    builder: SlashCommandBuilder;
    /** Executed when the command is used. */
    execute: SlashCommandCallback;
}

export interface PrefixCommand {
    /** Name of the command. */
    name: string;
    /** Different ways this command can be called. */
    aliases: string[];
    /** Description of the command. */
    description: string;
    /** How the command can be used. */
    usage: string;
    /** The category to place the command inside the help command list. */
    category: string;
    /** Extra options for this command. */
    options: PrefixCommandOptions;
    /** Executed when the command is used. */
    execute: PrefixCommandCallback;
}

export interface RawCommand {
    /** Name of the command. */
    name: string;
    /** Description of the command. */
    description: string;
    /** The category to place the command inside the help command list. */
    category: string;
    /** Type of command.
     * - `1` `CHAT_INPUT`
     *
     * - `2` `USER` - ui-based
     *
     * - `3` `MESSAGE` - ui-based */
    type: 1 | 2 | 3;
    /** Type of integrations.
     *
     * - `0` `GUILD_INSTALL`
     *
     * - `1` `USER_INSTALL` */
    integration_types: 0 | 1;
    /** Context of the integration.
     *
     * - `0` `GUILD`
     *
     * - `1` `BOT_DM`
     *
     * - `2` `PRIVATE_CHANNEL` */
    contexts: 0 | 1 | 2;
    /** Extra options for this command. */
    options: BaseCommandOptions;
    /** Executed when the command is used. */
    execute: BaseCommandCallback;
}
