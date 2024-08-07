/** @file Initializes the bot and gets everything up and ready. @author xsqu1znt */

import dotenv from "dotenv";
dotenv.config();

import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import AppCommandManager from "@utils/AppCommandManager";
import importers from "@utils/importers";
import logger from "@utils/logger";
import mongo from "@utils/mongo";

import { TOKEN, IS_DEV_MODE } from "@constants";

/* - - - - - { Check for TOKEN } - - - - - */
if (IS_DEV_MODE && !TOKEN) {
    logger.error("TOKEN Missing", "DEV_MODE is enabled, but TOKEN_DEV is not set");
    process.exit(0);
}

if (!TOKEN) {
    logger.error("TOKEN Missing", "TOKEN is not set");
    process.exit(0);
}

// prettier-ignore
if (IS_DEV_MODE) logger.debug("DEV_MODE is enabled! You can change this by setting DEV_MODE to false in either .env or config_client.json");

/* - - - - - { Setup Client } - - - - - */
logger.client.initializing();

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

    interaction: {
        all: new Collection(),
        contextMenu: new Collection(),
        userInstallable: new Collection()
    }
};

/* - - - - - { Import & Connect } - - - - - */
async function init(): Promise<void> {
    // Run Importers
    await importers(client);

    // Log the next step to console
    logger.client.conecting();

    // prettier-ignore
    // Connect the client to Discord
    client.login(TOKEN).then(async () => {
        const acm = new AppCommandManager(client);

        // Register commands to specific servers ( Local )
        // await acm.registerToLocal(["guild_id"]);

        // Remove commands from specific servers ( Local )
        /* NOTE: does nothing if commands were registered globally */
        // await acm.removeFromLocal(["guild_id"]);
        
        // Register commands to all servers and users ( Global )
        // await acm.registerToGlobal();
        
        // Remove commands from all servers and users ( Global )
        /* NOTE: does nothing if commands were registered locally */
        // await acm.removeFromGlobal();

        // await mongo.connect();

        logger.client.ready();
    });
}

init();
