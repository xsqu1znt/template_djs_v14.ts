import { SlashCommand } from "@customTypes/commands";

import { SlashCommandBuilder } from "discord.js";
import mongo from "@utils/mongo";
import jt from "@utils/jsTools";

export const __command: SlashCommand = {
    category: "Utility",
    options: { emoji: "🏓", deferReply: true },

    builder: new SlashCommandBuilder().setName("ping").setDescription("Check my ping!"),

    execute: async (client, interaction) => {
        // Ping the database
        let db_ping = jt.formatThousands(Number(await mongo.ping()));

        // Reply to the interaction with the client and database ping
        return await interaction.editReply({
            content: `Client: **${jt.formatThousands(client.ws.ping)}ms**, Database: **${db_ping}ms**`
        });
    }
};
