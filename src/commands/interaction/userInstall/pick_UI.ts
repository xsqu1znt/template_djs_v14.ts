import { UserInstallCommand } from "@customTypes/commands";

import { SlashCommandBuilder } from "discord.js";
import { BetterEmbed } from "@utils/discordTools";
import jt from "@utils/jsTools";

export default {
    builder: new SlashCommandBuilder()
        .setName("pick")
        .setDescription("Have me make that decision for you. Separate by comma.")

        .addStringOption(option =>
            option.setName("choices").setDescription("Choices to choose from. Separate by comma.").setRequired(true)
        ),

    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],

    execute: async (client, interaction) => {
        // Get the user's choices from the interaction
        let choices = interaction.options.get("choices", true);
        console.log(choices);
        return;

        // Create an array of responses
        let responses = [
            '"$CHOICE" seems like the right decision!',
            '"$CHOICE", I choose you!',
            'I choose "$CHOICE".',
            "$CHOICE"
        ];

        // Create the embed ( Cookie )
        let embed_cookie = new BetterEmbed({
            context: { interaction },
            description: jt.choice(responses)
        });

        // Reply to the interaction with the embed
        return await embed_cookie.send(interaction);
    }
} as UserInstallCommand;
