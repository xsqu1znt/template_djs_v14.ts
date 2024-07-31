/** @file Initializes the bot and gets everything up and ready. @author xsqu1znt */

import dotenv from "dotenv";
dotenv.config();

import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
// import slashCommandManager from "@utils/slashCommandManager";
import importers from "@utils/importers";
import logger from "@utils/logger";
import mongo from "@utils/mongo";

import config from "@configs";

// Environment
export const IS_DEV_MODE: boolean = process.env.DEV_MODE === "true" ? true : config.client.DEV_MODE;

/// Discord Token
const TOKEN_PROD: string = process.env.TOKEN || config.client.TOKEN;
const TOKEN_DEV: string = process.env.TOKEN_DEV || config.client.TOKEN_DEV;
export const TOKEN: string = IS_DEV_MODE ? TOKEN_DEV : TOKEN_PROD;

/// Mongo URI
const MONGO_URI_PROD: string = process.env.MONGO_URI || config.client.MONGO_URI;
const MONGO_URI_DEV: string = process.env.MONGO_URI_DEV || config.client.MONGO_URI_DEV;
export const MONGO_URI: string = IS_DEV_MODE ? MONGO_URI_DEV : MONGO_URI_PROD;

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
        userInstall: new Collection()
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
    	// Register slash commands to a specific server :: { LOCAL }
    	// await slashCommandManager.push(client, { ids: "your_id_here" });

    	// Register slash commands :: { GLOBAL }
    	// await slashCommandManager.push(client, { global: true });

    	// Remove commands (does nothing if commands were registered globally) :: { LOCAL }
    	// await slashCommandManager.remove(client, { ids: "your_id_here" });

    	// Remove commands (does nothing if commands were registered locally) :: { GLOBAL }
    	// await slashCommandManager.remove(client, { global: true });

        await mongo.connect();

        logger.client.ready();
    });
}

init();
