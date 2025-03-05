/** @file Initializes the bot and gets everything up and ready. @author xsqu1znt */

import dotenv from "dotenv";
dotenv.config();

import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import AppCommandManager from "@utils/AppCommandManager";
import importers from "@utils/importers";
import logger from "@utils/logger";
import mongo from "@utils/mongo";
import cli from "@utils/cli";

import { TOKEN, IN_DEV_MODE, argsv } from "@constants";

/* - - - - - { Check for TOKEN } - - - - - */
if (!TOKEN) {
    logger.error("TOKEN Missing", IN_DEV_MODE ? "DEV_MODE is enabled, but TOKEN_DEV is not set" : "TOKEN not set");
    process.exit(0);
}

if (IN_DEV_MODE) {
    logger.debug(
        "DEV_MODE is enabled! You can change this by setting DEV_MODE to false in either .env or configs/client.json",
        { timestamp: false, bold: true }
    );
}

/* - - - - - { Setup Client } - - - - - */
logger.client.starting();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ],

    partials: [Partials.Channel]
});

/* - - - - - { Custom Client Properties } - - - - - */
/* NOTE: You must define extra properties in './types/global.d.ts' before adding them here */
client.__name = IN_DEV_MODE ? "Template Bot (DEV)" : "Template Bot";

client.commands = {
    slash: {
        all: new Collection(),
        public: new Collection(),
        staff: new Collection(),
        custom: new Collection()
    },

    prefix: {
        all: new Collection(),
        public: new Collection(),
        staff: new Collection(),
        custom: new Collection()
    },

    special: {
        all: new Collection(),
        contextMenu: new Collection(),
        userInstallable: new Collection()
    }
};

/* - - - - - { Import & Connect } - - - - - */
async function init(): Promise<void> {
    // Run Importers
    await importers(client as Client<true>);

    // Log the next step to console
    logger.client.connecting();

    // Connect the client to Discord
    client.login(TOKEN).then(async () => {
        const acm = new AppCommandManager(client);

        // Register commands to specific servers ( Local )
        if (argsv.PUSH_COMMANDS_LOCAL) {
            await acm.registerToLocal(argsv.GUILD_IDS ?? ["guild_id"]);
        }

        // Remove commands from specific servers ( Local )
        else if (argsv.REMOVE_COMMANDS_LOCAL) {
            /* NOTE: does nothing if commands were registered globally */
            await acm.removeFromLocal(argsv.GUILD_IDS ?? ["guild_id"]);
        }

        // Register commands to all servers and users ( Global )
        else if (argsv.PUSH_COMMANDS_GLOBAL) {
            await acm.registerToGlobal();
        }

        // Remove commands from all servers and users ( Global )
        else if (argsv.REMOVE_COMMANDS_GLOBAL) {
            /* NOTE: does nothing if commands were registered locally */
            await acm.removeFromGlobal();
        }

        await mongo.connect();

        logger.client.ready(client);

        // Start the CLI
        cli(client, acm);
    });
}

init();
