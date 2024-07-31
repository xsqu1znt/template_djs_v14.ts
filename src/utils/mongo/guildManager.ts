import { guildModel } from "@models";
import docUtils from "./docUtils";

import config from "@configs";

export async function fetchPrefix(guild_id: string): Promise<string> {
    let prefix = (await docUtils.fetch(guildModel, guild_id, { query: { prefix: 1 } }))?.prefix;
    if (!prefix) await setPrefix(guild_id, config.client.PREFIX);
    return prefix || config.client.PREFIX;
}

async function setPrefix(guild_id: string, new_prefix: string): Promise<string> {
    await docUtils.update(guildModel, guild_id, { prefix: new_prefix }, { upsert: true });
    return new_prefix;
}
