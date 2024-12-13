import { PrefixCommand } from "@customTypes/commands";

import { guildManager } from "@utils/mongo";

export const __command: PrefixCommand = {
    name: "prefix",
    description: "Set the prefix for the current server.",
    category: "Utility",
    options: { emoji: "⚙️", guildOnly: true, requiredUserPerms: ["Administrator"] },

    execute: async (client, message, { cleanContent }) => {
        if (!message.inGuild()) return;

        const prefix = cleanContent || null;

        // Reply with the current prefix if a new prefix wasn't provided
        if (!prefix) {
            return await message.reply({
                content: `My prefix is \`${await guildManager.fetchPrefix(message.guild.id)}\`.`,
                allowedMentions: { repliedUser: false }
            });
        }

        // Set the prefix in the database
        await guildManager.setPrefix(message.guild.id, prefix);

        // Reply to the user with the new prefix
        return await message.reply({
            content: `My prefix has been changed to \`${prefix}\`.`,
            allowedMentions: { repliedUser: false }
        });
    }
};
