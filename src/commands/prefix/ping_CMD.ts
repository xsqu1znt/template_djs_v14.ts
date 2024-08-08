import { PrefixCommand } from "@customTypes/commands";

import mongo from "@utils/mongo";
import jt from "@utils/jsTools";

export default {
    name: "ping",
    description: "Check my ping!",
    category: "Utility",
    options: { emoji: "🏓" },

    execute: async (client, message) => {
        // Ping the database
        let db_ping = jt.formatThousands(Number(await mongo.ping()));

        // Reply to the interaction with the client and database ping
        return await message.reply({
            content: `Client: **${jt.formatThousands(client.ws.ping)}ms**, Database: **${db_ping}ms**`,
            allowedMentions: { repliedUser: false }
        });
    }
} as PrefixCommand;
