import { PrefixCommand } from "@customTypes/commands";

import mongo from "@utils/mongo";
import jsTools from "jstools";

export const __command: PrefixCommand = {
    name: "ping",
    description: "Check my ping!",
    category: "Utility",
    options: { emoji: "🏓" },

    execute: async (client, message) => {
        // Ping the database
        const db_ping = jsTools.formatThousands(Number(await mongo.ping()));

        // Reply to the interaction with the client and database ping
        return message.reply({
            content: `Client: **${jsTools.formatThousands(client.ws.ping)}ms**, Database: **${db_ping}ms**`,
            allowedMentions: { repliedUser: false }
        });
    }
};
