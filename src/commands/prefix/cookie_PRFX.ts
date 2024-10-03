import { PrefixCommand } from "@customTypes/commands";

import { BetterEmbed } from "@utils/discordTools";
import jt from "@utils/jsTools";

export const __command: PrefixCommand = {
    name: "cookie",
    description: "Get a cookie or a glass of milk.",
    category: "Fun",
    options: { emoji: "🍪" },

    execute: async (client, message) => {
        // Create an array of responses
        let choices = [
            "What's up, **$DISPLAY_NAME**! Have a cookie! :cookie:",
            "Hey, **$DISPLAY_NAME**! Have a glass of milk! :milk:"
        ];

        // Create the embed ( Cookie )
        let embed_cookie = new BetterEmbed({
            context: { message },
            description: jt.choice(choices)
        });

        // Reply to the message with the embed
        return await embed_cookie.send(message, { allowedMentions: { repliedUser: false } });
    }
};
