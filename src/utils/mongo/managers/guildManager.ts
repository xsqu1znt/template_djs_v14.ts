import { GuildModel } from "@utils/mongo/models";
import DocumentUtils from "@utils/mongo/docUtils";

import configs from "@configs";

const docUtils = new DocumentUtils(GuildModel);

async function fetchPrefix(guildId: string): Promise<string> {
    let prefix = (await docUtils.fetch(guildId, { projection: { prefix: 1 } }))?.prefix;
    if (!prefix) return await setPrefix(guildId, configs.client.PREFIX);
    return prefix || configs.client.PREFIX;
}

async function setPrefix(guildId: string, newPrefix: string): Promise<string> {
    await docUtils.update(guildId, { prefix: newPrefix }, { upsert: true });
    return newPrefix;
}

export const guildManager = {
    ...docUtils.__exports,
    fetchPrefix,
    setPrefix
};
