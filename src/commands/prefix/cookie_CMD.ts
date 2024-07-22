import { PrefixCommand } from "@customTypes/commands";

// import { BetterEmbed } from "@utils/discordTools";
// import jt from "@utils/jsTools";

export default {
    name: "cookie",
    category: "Fun",
    options: { emoji: "🍪" },

    execute: async (client, interaction) => {
        // Create an array of responses
        let choices = [
            "What's up, **$USER_NAME**! Have a cookie! :cookie:",
            "Hey, **$USER_NAME**! Have a glass of milk! :milk:"
        ];

        /* // Create the embed :: { COOKIE }
        let embed_cookie = new BetterEmbed({
            context: { interaction },
            description: jt.choice(choices)
        });

        // Reply to the interaction with the embed
        return await embed_cookie.send(interaction); */
    }
} as PrefixCommand;
