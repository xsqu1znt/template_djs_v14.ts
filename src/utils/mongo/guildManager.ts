import { guildModel } from "@models";
import DocumentUtils from "./docUtils";

import config from "@configs";

const docUtils = new DocumentUtils(guildModel);

async function fetchPrefix(guildId: string): Promise<string> {
    let prefix = (await docUtils.fetch(guildId, { projection: { prefix: 1 } }))?.prefix;
    if (!prefix) return await setPrefix(guildId, config.client.PREFIX);
    return prefix || config.client.PREFIX;
}

async function setPrefix(guildId: string, newPrefix: string): Promise<string> {
    await docUtils.update(guildId, { prefix: newPrefix }, { upsert: true });
    return newPrefix;
}

export default {
    ...docUtils.__exports,
    fetchPrefix,
    setPrefix
};
