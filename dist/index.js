"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = require("discord.js");
const logger = __importStar(require("@utils/logger"));
const jt = __importStar(require("@utils/jsTools"));
const config_client_json_1 = __importDefault(require("@configs/config_client.json"));
const TOKEN = process.env.TOKEN || config_client_json_1.default.TOKEN;
const TOKEN_DEV = process.env.TOKEN_DEV || config_client_json_1.default.TOKEN_DEV;
const DEV_MODE = process.env.DEV_MODE === "true" ? true : config_client_json_1.default.DEV_MODE;
if (DEV_MODE && !TOKEN_DEV) {
    logger.error("TOKEN Missing", "DEV_MODE is enabled, but TOKEN_DEV is not set");
    process.exit(0);
}
if (!TOKEN && !TOKEN_DEV) {
    logger.error("TOKEN Missing", "TOKEN is not set");
    process.exit(0);
}
if (DEV_MODE) {
    logger.debug("DEV_MODE is enabled! You can change this by setting DEV_MODE to false in either .env or config_client.json");
    process.exit(0);
}
logger.log("initializing...");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.DirectMessageReactions
    ],
    partials: [discord_js_1.Partials.Channel]
});
client.slashCommands = {
    all: new discord_js_1.Collection(),
    public: new discord_js_1.Collection(),
    staff: new discord_js_1.Collection(),
    userInstall: new discord_js_1.Collection(),
    custom: new discord_js_1.Collection()
};
client.prefixCommands = new discord_js_1.Collection();
let importers_dir = jt.readDir("@utils/importers").filter(fn => fn.startsWith("import_") && fn.endsWith(".ts"));
importers_dir.forEach(fn => {
    try {
        require(`@utils/importers/${fn}`)(client);
    }
    catch (err) {
        logger.error("Importer failed to load", `\'${fn}\' could not initialize`, err);
    }
});
console.log("connecting to Discord...");
client.login(DEV_MODE ? TOKEN_DEV : TOKEN).then(async () => {
});
