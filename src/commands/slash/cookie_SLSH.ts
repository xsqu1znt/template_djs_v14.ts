import { SlashCommand } from "@customTypes/commands";

import { SlashCommandBuilder } from "discord.js";
// import { BetterEmbed } from "@utils/discordTools";
import * as jt from "@utils/jsTools";

export default {
    category: "Fun",
    options: { emoji: "🍪" },

    // prettier-ignore
    builder: new SlashCommandBuilder().setName("cookie")
        .setDescription("Get a cookie or a glass of milk."),

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
} as SlashCommand;
