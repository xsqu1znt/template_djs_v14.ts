import { PrefixCommand } from "@customTypes/commands";

import { BetterEmbed, PageNavigator } from "@utils/discordTools";
import jt from "@utils/jsTools";

export default {
    name: "test",
    description: "Just a test command.",
    category: "Fun",
    options: { emoji: "🍪" },

    execute: async (client, message, {}) => {
        // Create the embed ( Cookie )
        let embed_ssm1 = new BetterEmbed({
            description: "select menu 1"
        });

        let embed_ssm2 = new BetterEmbed({
            description: "select menu 2"
        });

        let embed_nested1 = new BetterEmbed({
            description: "nested page 1"
        });

        let embed_nested2 = new BetterEmbed({
            description: "nested page 2"
        });

        // Create and configure the PageNavigator
        let pageNav = new PageNavigator({
            allowedParticipants: message.author,
            type: "short",
            // dynamic: false,
            // timeout: "1m",
            // useReactions: false,

            /* postTimeout: {
                disableComponents: false,
                clearComponentsOrReactions: true,
                deleteMessage: false
            }, */

            pages: [
                // single page (select menu)
                { embed: embed_ssm1 },
                // single page (select menu)
                { embed: embed_ssm2, content: "a message you can have above the embed" },
                // nested (page navigation buttons)
                { nestedEmbeds: [embed_nested1, embed_nested2], nestedContent: ["nested 1", "nested 2"] }
            ]
        });

        // Add the select menu options
        pageNav.addSelectMenuOptions(
            { label: "select menu 1", description: "lorem ipsum dolor sit amut" },
            { label: "select menu 2", description: "lorem ipsum dolor sit amut" },
            { label: "nested pages", description: "lorem ipsum dolor sit amut" }
        );

        return await pageNav.send(message.channel);
    }
} as PrefixCommand;
