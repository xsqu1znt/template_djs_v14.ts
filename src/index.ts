/** @file Initializes the bot and gets everything up and ready. @author xsqu1znt */

import dotenv from "dotenv";
dotenv.config();

import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
// import * as slashCommandManager from "@utils/slashCommandManager";
import * as logger from "@utils/logger";
// import * as mongo from "@utils/mongo";
import * as jt from "@utils/jsTools";

import config from "@configs/config_client.json";

const TOKEN: string = process.env.TOKEN || config.TOKEN;
const TOKEN_DEV: string = process.env.TOKEN_DEV || config.TOKEN_DEV;
const DEV_MODE: boolean = process.env.DEV_MODE === "true" ? true : config.DEV_MODE;

/* - - - - - { Check for TOKEN } - - - - - */
if (DEV_MODE && !TOKEN_DEV) {
    logger.error("TOKEN Missing", "DEV_MODE is enabled, but TOKEN_DEV is not set");
    process.exit(0);
}

if (!TOKEN && !TOKEN_DEV) {
    logger.error("TOKEN Missing", "TOKEN is not set");
    process.exit(0);
}

// prettier-ignore
if (DEV_MODE) {
    logger.debug("DEV_MODE is enabled! You can change this by setting DEV_MODE to false in either .env or config_client.json");
    process.exit(0);
}

/* - - - - - { Setup Client } - - - - - */
logger.log("initializing...");

// Bot ready phase
const client: Client = new Client({
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
/* NOTE: You must define extra properties in './types.d.ts' before adding them here */

client.slashCommands = {
    all: new Collection(),
    public: new Collection(),
    staff: new Collection(),
    userInstall: new Collection(),
    custom: new Collection()
};

client.prefixCommands = {
    all: new Collection(),
    public: new Collection(),
    staff: new Collection(),
    custom: new Collection()
};

// Run Importers
let importers_dir = jt.readDir("@utils/importers").filter(fn => fn.startsWith("import") && fn.endsWith(".ts"));

//prettier-ignore
importers_dir.forEach(fn => {
	try { require(`@utils/importers/${fn}`)(client); }
	catch (err: any) { logger.error("Importer failed to load", `\'${fn}\' could not initialize`, err); }
});

// Connect the client to Discord
console.log("connecting to Discord...");

// prettier-ignore
client.login(DEV_MODE ? TOKEN_DEV : TOKEN).then(async () => {
	// Register slash commands to a specific server :: { LOCAL }
	// await slashCommandManager.push(client, { ids: "your_id_here" });

	// Register slash commands :: { GLOBAL }
	// await slashCommandManager.push(client, { global: true });

	// Remove commands (does nothing if commands were registered globally) :: { LOCAL }
	// await slashCommandManager.remove(client, { ids: "your_id_here" });

	// Remove commands (does nothing if commands were registered locally) :: { GLOBAL }
	// await slashCommandManager.remove(client, { global: true });

	// await mongo.connect();
});
