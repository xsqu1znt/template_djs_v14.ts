import { PrefixCommand } from "@customTypes/commands";

import { BetterEmbed, PageNavigator } from "@utils/discordTools";

export default {
    name: "test",
    description: "Test command.",

    execute: async (client, message, {}) => {
        let embed_test = new BetterEmbed({
            description: "Hello, **$DISPLAY_NAME**!"
        });

        let embed_test2 = new BetterEmbed({
            description: "Welcome to an example use case of the `PageNavigator` utility."
        });

        let embed_test3 = new BetterEmbed({
            description: "Feel free to tell @842555247145779211 fuck you!"
        });

        let pageNav = new PageNavigator({
            allowedParticipants: [message.author],
            pages: [{ embeds: [embed_test, embed_test2, embed_test3] }]
        });

        return await pageNav.send(message.channel);
    }
} as PrefixCommand;
