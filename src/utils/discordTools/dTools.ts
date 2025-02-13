import {
    AnyThreadChannel,
    Client,
    DMChannel,
    Guild,
    GuildBasedChannel,
    GuildMember,
    Message,
    PartialDMChannel,
    PartialGroupDMChannel,
    Role,
    TextBasedChannel,
    TextChannel,
    User,
    VoiceBasedChannel
} from "discord.js";

type MentionType = "user" | "channel" | "role";
type ChannelType = "dm" | "text" | "thread" | "voice" | "any";

type FetchedChannel<T> = T extends "dm"
    ? PartialGroupDMChannel | DMChannel | PartialDMChannel
    : T extends "text"
      ? GuildBasedChannel & TextBasedChannel
      : T extends "thread"
        ? AnyThreadChannel
        : T extends "any"
          ? GuildBasedChannel
          : VoiceBasedChannel;

/** Returns the string if it's populated, or "0" otherwise.
 *
 * Useful for fetching where the provided ID may or may not exist.
 * @param str The string to check. */
export function __zero(str?: string | undefined | null): string {
    return str?.length ? str : "0";
}

/** Check if the given string is a mention or a snowflake.
 *
 * Looks for formats like `<@123456789>`, or a numeric string with at least 6 digits.
 * @param str The string to check. */
export function isMentionOrSnowflake(str: string): boolean {
    return str.match(/<@[#&]?[\d]{6,}>/) || str.match(/\d{6,}/) ? true : false;
}

/** Remove mention syntax from a string.
 * @param str The string to clean. */
export function cleanMention(str: string): string {
    return str.replaceAll(/[<@#&>]/g, "").trim();
}

/** Get the ID of the first mention of a specified type from a message or message content.
 * @param options Optional options that aren't really optional. */
export function getFirstMentionId(options: { message?: Message; content?: string; type: MentionType }): string {
    let mentionId = "";

    if (options.message) {
        switch (options.type) {
            case "user":
                mentionId = options.message.mentions.users.first()?.id || "";
            case "channel":
                mentionId = options.message.mentions.channels.first()?.id || "";
            case "role":
                mentionId = options.message.mentions.roles.first()?.id || "";
        }
    }

    const firstArg = options.content?.split(" ")[0] || "";
    return mentionId || isMentionOrSnowflake(firstArg) ? cleanMention(firstArg) : "";
}

/** Fetch a user from the client, checking the cache first.
 * @param client - The client to fetch the user from.
 * @param userId - The ID of the user to fetch. */
export async function fetchUser(client: Client<true>, userId: string): Promise<User | null> {
    return client.users.cache.get(userId) || (await client.users.fetch(__zero(userId)).catch(() => null));
}

/** Fetch a guild from the client, checking the cache first.
 * @param client - The client to fetch the guild from.
 * @param guildId - The ID of the guild to fetch. */
export async function fetchGuild(client: Client<true>, guildId: string): Promise<Guild | null> {
    return client.guilds.cache.get(guildId) || (await client.guilds.fetch(__zero(guildId)).catch(() => null));
}

/** Fetch a member from a guild, checking the cache first.
 * @param guild - The guild to fetch the member from.
 * @param memberId - The ID of the member to fetch. */
export async function fetchMember(guild: Guild, memberId: string): Promise<GuildMember | null> {
    return guild.members.cache.get(memberId) || (await guild.members.fetch(__zero(memberId)).catch(() => null));
}

/** Fetch a channel from a guild, checking the cache first.
 *
 * ***NOTE:*** If the channel type does not match the provided type or the channel is null, null is returned.
 * @param guild - The guild to fetch the channel from.
 * @param channelId - The ID of the channel to fetch.
 * @param type - The type of channel to fetch. */
export async function fetchChannel<T extends ChannelType>(
    guild: Guild,
    channelId: string,
    type: T
): Promise<FetchedChannel<T> | null> {
    const channel = guild.channels.cache.get(channelId) || (await guild.channels.fetch(__zero(channelId)).catch(() => null));

    switch (type) {
        case "dm":
            if (!channel?.isDMBased()) return null;
        case "text":
            if (!channel?.isTextBased()) return null;
        case "thread":
            if (!channel?.isThread()) return null;
        case "voice":
            if (!channel?.isVoiceBased()) return null;
    }

    return channel ? (channel as any) : null;
}

/** Fetch a role from a guild, checking the cache first.
 * @param guild - The guild to fetch the role from.
 * @param roleId - The ID of the role to fetch. */
export async function fetchRole(guild: Guild, roleId: string): Promise<Role | null> {
    return guild.roles.cache.get(roleId) || (await guild.roles.fetch(__zero(roleId)).catch(() => null)) || null;
}

/** Fetch a message from a channel, checking the cache first.
 * @param channel - The channel to fetch the message from.
 * @param messageId - The ID of the message to fetch. */
export async function fetchMessage(channel: TextChannel | VoiceBasedChannel, messageId: string): Promise<Message | null> {
    return (
        channel.messages.cache.get(messageId) || (await channel.messages.fetch(__zero(messageId)).catch(() => null)) || null
    );
}

export default {
    __zero,
    isMentionOrSnowflake,
    cleanMention,
    getFirstMentionId,
    fetchUser,
    fetchGuild,
    fetchMember,
    fetchChannel,
    fetchRole,
    fetchMessage
};
