import { ContextMenuCommand } from "@customTypes/commands";

import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { BetterEmbed } from "@utils/discordTools";

export default {
    category: "Fun",

    builder: new ContextMenuCommandBuilder().setName("View Avatar")
        .setType(ApplicationCommandType.User),

    execute: async (client, interaction) => {
        // Defines the type of context menu command
        if (!interaction.isUserContextMenuCommand()) return;

        // Create the embed ( Avatar )
        let embed_avatar = new BetterEmbed({
            title: `${interaction.targetUser.username}'s Avatar`,
            imageURL: interaction.targetUser.displayAvatarURL({ size: 4096 })
        });

        // Reply to the interaction with the embed
        return await embed_avatar.send(interaction);
    }
} as ContextMenuCommand;
