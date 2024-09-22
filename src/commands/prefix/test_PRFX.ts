import { PrefixCommand } from "@customTypes/commands";

import { awaitConfirm, BetterEmbed } from "@utils/discordTools";

export default {
    name: "test",
    description: "A test command.",
    category: "Fun",
    options: { emoji: "🍪" },

    execute: async (client, message, {}) => {
        const confirmation = await awaitConfirm(message, {
            allowedParticipants: message.author,
            embed: new BetterEmbed({ description: "Custom confirmation embed", color: "LuminousVividPink" }),
            allowedMentions: { repliedUser: false },
            onResolve: { deleteOnConfirm: false, deleteOnCancel: false, disableComponents: true }
        });

        return await message.reply(`confirmation: ${confirmation}`);
    }
} as PrefixCommand;
