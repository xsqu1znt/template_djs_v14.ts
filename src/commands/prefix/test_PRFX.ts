import { PrefixCommand } from "@customTypes/commands";

import { BetterEmbed, PageNavigator } from "@utils/discordTools";

export default {
    name: "test",
    description: "Test command.",

    execute: async (client, message, {}) => {
        let embed_test = new BetterEmbed({
            context: { message },
            description: "Hello, **$DISPLAY_NAME**!"
        });

        let embed_test2 = new BetterEmbed({
            description: "Welcome to an example use case of the `PageNavigator` utility."
        });

        let embed_test3 = new BetterEmbed({
            description: "Feel free to tell <@842555247145779211> fuck you!"
        });

        let pageNav = new PageNavigator({
            allowedParticipants: [message.author],
            pages: [{ embed: embed_test }, { embed: embed_test2 }, { embed: embed_test3 }]
        });

        pageNav.addSelectMenuOptions({ label: "Page 1" }, { label: "Page 2" }, { label: "Page 3" });
        
        await pageNav.send(message.channel);
        console.log(pageNav.data);
        console.log(pageNav.options);
        return;
    }
} as PrefixCommand;
