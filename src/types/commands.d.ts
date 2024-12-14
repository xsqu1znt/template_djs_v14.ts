import { SlashCommandOptionsOnlyBuilder } from "discord.js";
import {
    BaseInteraction,
    Client,
    ClientEvents,
    CommandInteraction,
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    InteractionResponse,
    Message,
    MessageContextMenuCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder,
    UserContextMenuCommandInteraction
} from "discord.js";

/* - - - - - { Types } - - - - - */
export interface SlashCommand {
    /** Slash command builder. */
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    /** The category to place the command inside the help command. */
    category?: string;
    /** Extra options for this command. */
    options?: InteractionBasedCommandOptions;
    /** Executed when the command is used. */
    execute: (client: Client<true>, interaction: CommandInteraction) => Promise<InteractionResponse | Message | void | null>;
}

export interface GuildSlashCommand extends SlashCommand {
    /** Extra options for this command. */
    options?: InteractionBasedCommandOptions & { guildOnly: true };
    /** Executed when the command is used. */
    execute: (
        client: Client<true>,
        interaction: CommandInteraction<"cached">
    ) => Promise<InteractionResponse | Message | void | null>;
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
    execute: (client: Client<true>, message: Message, extra: PrefixCommandParams) => Promise<Message | void | null>;
}

export interface GuildPrefixCommand extends PrefixCommand {
    /** Extra options for this command. */
    options?: PrefixCommandOptions & { guildOnly: true };
    /** Executed when the command is used. */
    execute: (client: Client<true>, message: Message<true>, extra: PrefixCommandParams) => Promise<Message | void | null>;
}

export interface ContextMenuCommand {
    /** Context menu builder. */
    builder: ContextMenuCommandBuilder;
    /** The category to place the command inside the help command list. */
    category?: string;
    /** Extra options for this command. */
    options?: Omit<InteractionBasedCommandOptions, "emoji" | "hidden">;
    /** Executed when the command is used. */
    execute: (
        client: Client<true>,
        interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction
    ) => Promise<Message | void | null>;
}

export interface GuildContextMenuCommand extends ContextMenuCommand {
    /** Extra options for this command. */
    options?: Omit<InteractionBasedCommandOptions, "emoji" | "hidden"> & { guildOnly: true };
    /** Executed when the command is used. */
    execute: (
        client: Client<true>,
        interaction: UserContextMenuCommandInteraction<"cached"> | MessageContextMenuCommandInteraction<"cached">
    ) => Promise<Message | void | null>;
}

export interface UserInstallableCommand {
    /** Slash command builder. */
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    /** Type of command. Can only be `CHAT_INPUT` for user installable commands.
     * - `1` `CHAT_INPUT`
     *
     * - `2` `USER` - ui-based
     *
     * - `3` `MESSAGE` - ui-based */
    type: 1;
    /** Type of integrations.
     *
     * - `0` `GUILD_INSTALL`
     *
     * - `1` `USER_INSTALL` */
    integration_types: Array<0 | 1>;
    /** Context of the integration.
     *
     * - `0` `GUILD`
     *
     * - `1` `BOT_DM`
     *
     * - `2` `PRIVATE_CHANNEL` */
    contexts: Array<0 | 1 | 2>;
    /** The category to place the command inside the help command list. */
    category?: string;
    /** Extra options for this command. */
    options?: Omit<InteractionBasedCommandOptions, "emoji" | "hidden">;
    /** Executed when the command is used. */
    execute: (client: Client<true>, interaction: CommandInteraction) => Promise<Message | void | null>;
}

export interface GuildUserInstallableCommand extends UserInstallableCommand {
    /** Extra options for this command. */
    options?: Omit<InteractionBasedCommandOptions, "emoji" | "hidden"> & { guildOnly: true };
    /** Executed when the command is used. */
    execute: (client: Client<true>, interaction: CommandInteraction<"cached">) => Promise<Message | void | null>;
}

/* - - - - - { Options } - - - - - */
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
    integration_types: Array<0 | 1>;
    /** Context of the integration.
     *
     * - `0` `GUILD`
     *
     * - `1` `BOT_DM`
     *
     * - `2` `PRIVATE_CHANNEL` */
    contexts: Array<0 | 1 | 2>;
}

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

interface InteractionBasedCommandOptions extends BaseCommandOptions {
    /** Defer the interaction.
     *
     * ___NOTE:___ Required if the Slash Command can take longer than 3 seconds to execute. */
    deferReply?: boolean;
    /** Defer the interaction ephemerally.
     *
     * ___NOTE:___ Required if the Slash Command can take longer than 3 seconds to execute. */
    deferReplyEphemeral?: boolean;
}

interface PrefixCommandOptions extends BaseCommandOptions {}

/* - - - - - { Callback Parameters } - - - - - */
interface PrefixCommandParams {
    /** The prefix used. */
    prefix: string;
    /** The command's name. */
    commandName: string;
    /** Message content without the command name. */
    cleanContent: string;
}
