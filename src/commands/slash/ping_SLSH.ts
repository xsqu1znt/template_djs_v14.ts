import { SlashCommand } from "@customTypes/commands";

import { SlashCommandBuilder } from "discord.js";
import mongo from "@utils/mongo";
import jsTools from "jstools";

export const __command: SlashCommand = {
    category: "Utility",
    options: { emoji: "🏓", deferReply: true },

    builder: new SlashCommandBuilder().setName("ping").setDescription("Check my ping!"),

    execute: async (client, interaction) => {
        // Ping the database
        let db_ping = jsTools.formatThousands(Number(await mongo.ping()));

        // Reply to the interaction with the client and database ping
        return interaction.editReply({
            content: `Client: **${jsTools.formatThousands(client.ws.ping)}ms**, Database: **${db_ping}ms**`
        });
    }
};
