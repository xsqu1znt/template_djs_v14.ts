import { SlashCommand } from "@customTypes/commands";

import { SlashCommandBuilder } from "discord.js";
import { BetterEmbed } from "@utils/discordTools";
import jt from "@utils/jsTools";

const categoryIcons: { [key: string]: string } = {
    Fun: "",
    Utility: "⚙️",
    Other: ""
};

export default {
    category: "Utility",
    options: { hidden: true },

    builder: new SlashCommandBuilder().setName("help").setDescription("View a list of my commands."),

    execute: async (client, interaction) => {
        // Get the current slash commands and filter out ones that are set to be hidden
        let commands = [...client.commands.slash.all.values()].filter(cmd => !cmd?.options?.hidden);

        /* error */
        if (!commands.length) {
            return await interaction.reply({ content: "There are no commands available.", ephemeral: true });
        }

        // Parse command categories
        let categoryNames = jt.unique(
            commands.map(cmd => {
                let _name = cmd?.category || "Other";
                let _icon = _name in categoryIcons ? categoryIcons[_name] : null;
                return { name: _name, icon: _icon };
            }),
            "name"
        );
    }
} as SlashCommand;
