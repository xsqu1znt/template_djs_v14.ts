import { GuildPrefixCommand } from "@customTypes/commands";

import { guildManager } from "@utils/mongo/managers";

export const __command: GuildPrefixCommand = {
    name: "prefix",
    description: "Set the prefix for the current server.",
    category: "Utility",
    usage: "<prefix>",
    options: { emoji: "⚙️", guildOnly: true, guildAdminOnly: true },

    execute: async (client, message, { cleanContent }) => {
        const prefix = cleanContent || null;

        // Reply with the current prefix if a new prefix wasn't provided
        if (!prefix) {
            return message.reply({
                content: `My prefix is \`${await guildManager.fetchPrefix(message.guild.id)}\`.`,
                allowedMentions: { repliedUser: false }
            });
        }

        // Set the prefix in the database
        await guildManager.setPrefix(message.guild.id, prefix);

        // Reply to the user with the new prefix
        return message.reply({
            content: `My prefix has been changed to \`${prefix}\`.`,
            allowedMentions: { repliedUser: false }
        });
    }
};
