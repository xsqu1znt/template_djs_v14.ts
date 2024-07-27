import {
    Client,
    ClientEvents,
    CommandInteraction,
    ContextMenuCommandBuilder,
    Message,
    PermissionResolvable,
    SlashCommandBuilder
} from "discord.js";

/* - - - - - { Types } - - - - - */
export interface SlashCommand {
    /** The category to place the command inside the help command. */
    category?: string;
    /** Extra options for this command. */
    options?: SlashCommandOptions;
    /** Slash command builder. */
    builder: SlashCommandBuilder;
    /** Executed when the command is used. */
    execute: (client: Client, interaction: CommandInteraction) => Promise<Message | void | null>;
}

export interface PrefixCommand {
    /** Name of the command. */
    name: string;
    /** Different ways this command can be called. */
    aliases?: string[];
    /** Description of the command. */
    description?: string;
    /** An example showing how the command can be used inside the help command list. */
    usage?: string;
    /** The category to place the command inside the help command list. */
    category?: string;
    /** Extra options for this command. */
    options?: PrefixCommandOptions;
    /** Executed when the command is used. */
    execute: (client: Client, message: Message, extra: PrefixCommandParams) => Promise<Message | void | null>;
}

export interface InteractionCommand {
    /** Raw command data instead of a command builder. */
    raw?: RawCommandData;
    /** Command builder. */
    builder?: ContextMenuCommandBuilder;
    /** The category to place the command inside the help command list. */
    category?: string;
    /** Extra options for this command. */
    options?: BaseCommandOptions;
    /** Executed when the command is used. */
    execute: (client: Client, interaction: CommandInteraction) => Promise<Message | void | null>;
}

/* - - - - - { Options } - - - - - */
interface BaseCommandOptions {
    /** The emoji to show in the help command list. Can also be a custom emoji.
     *
     * `<:Emoji_Name:Emoji_ID>` - for custom emojis.
     *
     * `<a:Emoji_Name:Emoji_ID>` - for animated custom emojis. */
    emoji?: string;
    /** Only allow this command to be used in guilds. */
    guildOnly?: boolean;
    /** Only allow staff members of this bot's team to use this command.
     *
     * @see `config_client.json` `.staff` */
    botStaffOnly?: boolean;
    /** Only allow guild admins to use this command. */
    guildAdminOnly?: boolean;
    /** Require the user to have certain permissions in the current guild. */
    requiredUserPerms?: PermissionResolvable[];
    /** Require the client to have certain permissions in the current guild. */
    requiredClientPerms?: PermissionResolvable[];
    /** Hide this command from the help command list. */
    hidden?: boolean;
}

interface SlashCommandOptions extends BaseCommandOptions {
    /** Defer the interaction.
     *
     * ___NOTE___: Required if the Slash Command can take longer than 3 seconds to execute. */
    deferReply?: boolean;
    /** Defer the interaction ephemerally.
     *
     * ___NOTE___: Required if the Slash Command can take longer than 3 seconds to execute. */
    deferReplyEphemeral?: boolean;
}

interface PrefixCommandOptions extends BaseCommandOptions {}

interface RawCommandData {
    /** Name of the command. */
    name: string;
    /** Description of the command. */
    description: string;
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
}

/* - - - - - { Callback Parameters } - - - - - */
interface PrefixCommandParams {
    /** The prefix used. */
    prefix: string;
    /** The command's name. */
    commandName: string;
    /** Message content without the command name. */
    cleanContent: string;
    /** Helper function to get an optional parameter from the message's content. */
    getCommandOption: (flagPrefix: string, flagName: string, allowSpaces: boolean) => any | void | null;
}
