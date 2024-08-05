import { ContextMenuCommand } from "@customTypes/commands";

import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { BetterEmbed } from "@utils/discordTools";
import jt from "@utils/jsTools";

export default {
    category: "Fun",

    // prettier-ignore
    builder: new ContextMenuCommandBuilder().setName("cookie")
        .setType(ApplicationCommandType.User),

    execute: async (client, interaction) => {
        // Create an array of responses
        let choices = [
            "What's up, **$USER_NAME**! Have a cookie! :cookie:",
            "Hey, **$USER_NAME**! Have a glass of milk! :milk:"
        ];

        // Create the embed ( Cookie )
        let embed_cookie = new BetterEmbed({
            context: { interaction },
            description: jt.choice(choices)
        });

        // Reply to the interaction with the embed
        return await embed_cookie.send(interaction);
    }
} as ContextMenuCommand;
