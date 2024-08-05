import { ContextMenuCommand } from "@customTypes/commands";

import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { BetterEmbed } from "@utils/discordTools";

export default {
    category: "Fun",

    // prettier-ignore
    builder: new ContextMenuCommandBuilder().setName("avatar")
        .setType(ApplicationCommandType.User),

    execute: async (client, interaction) => {
        // Defines the type of context menu command
        if (!interaction.isUserContextMenuCommand()) return;

        // Get the user's avatar
        let userAvatar = interaction.targetUser.displayAvatarURL({ size: 4096 });

        // Create the embed ( Avatar )
        let embed_avatar = new BetterEmbed({
            title: `${interaction.targetUser.username}'s Avatar`,
            imageURL: userAvatar
        });

        // Reply to the interaction with the embed
        return await embed_avatar.send(interaction);
    }
} as ContextMenuCommand;
