import { PrefixCommand } from "@customTypes/commands";

import { BetterEmbed } from "djstools";
import jsTools from "jstools";

export const __command: PrefixCommand = {
    name: "cookie",
    description: "Get a cookie or a glass of milk.",
    category: "Fun",
    options: { emoji: "🍪" },

    execute: async (client, message) => {
        // Create an array of responses
        const choices = [
            "What's up, **$USER_NAME**! Have a cookie! :cookie:",
            "Hey, **$USER_NAME**! Have a glass of milk! :milk:"
        ];

        // Create the embed ( Cookie )
        const embed_cookie = new BetterEmbed({
            context: { message },
            description: jsTools.choice(choices)
        });

        // Reply to the message with the embed
        return embed_cookie.send(message, { allowedMentions: { repliedUser: false } });
    }
};
