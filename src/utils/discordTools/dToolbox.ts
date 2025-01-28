import { Guild, GuildBasedChannel, GuildMember, Message, Role } from "discord.js";

/** Returns the string if it's populated, or "0".
 *
 * Useful for fetching where the provided ID may or may not exist. */
export function __zero(str?: string | undefined | null): string {
    return str?.length ? str : "0";
}

export function isMentionOrSnowflake(str: string): boolean {
    return str.match(/<@[#&]?[\d]{6,}>/) || str.match(/\d{6,}/) ? true : false;
}

export function cleanMention(str: string): string {
    return str.replaceAll(/[<@#&>]/g, "").trim();
}

export function getFirstMentionId(options: {
    message?: Message;
    content?: string;
    type: "user" | "channel" | "role";
}): string {
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

export async function fetchMember(guild: Guild, memberId: string): Promise<GuildMember | null> {
    return guild.members.cache.get(memberId) || (await guild.members.fetch(__zero(memberId))) || null;
}

export async function fetchChannel(guild: Guild, channelId: string): Promise<GuildBasedChannel | null> {
    return guild.channels.cache.get(channelId) || (await guild.channels.fetch(__zero(channelId))) || null;
}

export async function fetchRole(guild: Guild, roleId: string): Promise<Role | null> {
    return guild.roles.cache.get(roleId) || (await guild.roles.fetch(__zero(roleId))) || null;
}

export default { __zero, isMentionOrSnowflake, cleanMention, getFirstMentionId, fetchMember, fetchChannel, fetchRole };
