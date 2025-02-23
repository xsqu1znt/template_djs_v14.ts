import { SlashCommand } from "@customTypes/commands";

import { SlashCommandBuilder } from "discord.js";
import { BetterEmbed } from "djstools";
import jsTools from "jstools";

export const __command: SlashCommand = {
    category: "Fun",
    options: { emoji: "🍪" },

    builder: new SlashCommandBuilder().setName("cookie").setDescription("Get a cookie or a glass of milk."),

    execute: async (client, interaction) => {
        // Create an array of responses
        let choices = [
            "What's up, **$USER_NAME**! Have a cookie! :cookie:",
            "Hey, **$USER_NAME**! Have a glass of milk! :milk:"
        ];

        // Create the embed ( Cookie )
        let embed_cookie = new BetterEmbed({
            context: { interaction },
            description: jsTools.choice(choices)
        });

        // Reply to the interaction with the embed
        return embed_cookie.send(interaction);
    }
};
