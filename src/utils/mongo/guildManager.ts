import { guildModel } from "@models";
import DocumentUtils from "./docUtils";

import config from "@configs";

const docUtils = new DocumentUtils(guildModel);

async function fetchPrefix(guild_id: string): Promise<string> {
    let prefix = (await docUtils.fetch(guild_id, { query: { prefix: 1 } }))?.prefix;
    if (!prefix) return await setPrefix(guild_id, config.client.PREFIX);
    return prefix || config.client.PREFIX;
}

async function setPrefix(guild_id: string, new_prefix: string): Promise<string> {
    await docUtils.update(guild_id, { prefix: new_prefix }, { upsert: true });
    return new_prefix;
}

export default {
    ...docUtils.exports,
    fetchPrefix,
    setPrefix
};
