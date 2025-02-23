import { UserInstallableCommand } from "@customTypes/commands";

import { SlashCommandBuilder } from "discord.js";
import { BetterEmbed } from "djstools";
import jsTools from "jstools";

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
        const choices = interaction.options.get("choices", true).value as string;

        // Create the embed ( Pick )
        const embed_pick = new BetterEmbed({
            context: { interaction },
            description: jsTools.choice(choices.split(",")).trim()
        });

        // Reply to the interaction with the embed
        return embed_pick.send(interaction);
    }
};
