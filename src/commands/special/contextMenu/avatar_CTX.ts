import { ContextMenuCommand } from "@customTypes/commands";

import { ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandType } from "discord.js";
import { BetterEmbed } from "djstools";

export const __command: ContextMenuCommand = {
    category: "Fun",

    builder: new ContextMenuCommandBuilder()
        .setName("View Avatar")
        .setType(ApplicationCommandType.User as ContextMenuCommandType),

    execute: async (client, interaction) => {
        // Defines the type of context menu command
        if (!interaction.isUserContextMenuCommand()) return;

        // Create the embed ( Avatar )
        const embed_avatar = new BetterEmbed({
            title: `${interaction.targetUser.username}'s Avatar`,
            imageURL: interaction.targetUser.displayAvatarURL({ size: 4096 })
        });

        // Reply to the interaction with the embed
        return embed_avatar.send(interaction);
    }
};
