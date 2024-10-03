import { UserInstallableCommand } from "@customTypes/commands";

import { SlashCommandBuilder } from "discord.js";
import { BetterEmbed } from "@utils/discordTools";
import jt from "@utils/jsTools";

export const __command: UserInstallableCommand = {
    builder: new SlashCommandBuilder()
        .setName("pick")
        .setDescription("Have me make that decision for you. Separate by comma.")

        .addStringOption(option =>
            option.setName("choices").setDescription("Choices to choose from (separate by comma).").setRequired(true)
        ),

    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],

    execute: async (client, interaction) => {
        // Get the user's choices from the interaction
        let choices = interaction.options.get("choices", true).value as string;

        // Create the embed ( Pick )
        let embed_pick = new BetterEmbed({
            context: { interaction },
            description: jt.choice(choices.split(",")).trim()
        });

        // Reply to the interaction with the embed
        return await embed_pick.send(interaction);
    }
};
