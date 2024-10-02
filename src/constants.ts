import config from "@configs";

/* - - - - - { CLI } - - - - -  */
const argsv: string[] = process.argv.slice(2);

export const cli = {
    GUILD_IDS: argsv.find(arg => arg.startsWith("--guild="))?.split(" ") as string[],
    PUSH_COMMANDS_LOCAL: argsv.includes("--push-local") as boolean,
    REMOVE_COMMANDS_LOCAL: argsv.includes("--remove-local") as boolean,
    PUSH_COMMANDS_GLOBAL: argsv.includes("--push-global") as boolean,
    REMOVE_COMMANDS_GLOBAL: argsv.includes("--remove-global") as boolean
};

/* - - - - - { Environment } - - - - -  */
/** Whether the environment is in development mode. */
export const IS_DEV_MODE: boolean = process.env.DEV_MODE === "true" ? true : config.client.DEV_MODE;

/* - - - - - { Discord Token } - - - - -  */
const TOKEN_PROD: string = process.env.TOKEN || config.client.TOKEN;
const TOKEN_DEV: string = process.env.TOKEN_DEV || config.client.TOKEN_DEV;
/** The token used to authenticate with `Discord`. */
export const TOKEN: string = IS_DEV_MODE ? TOKEN_DEV : TOKEN_PROD;

/* - - - - - { Mongo URI } - - - - -  */
const MONGO_URI_PROD: string = process.env.MONGO_URI || config.client.MONGO_URI;
const MONGO_URI_DEV: string = process.env.MONGO_URI_DEV || config.client.MONGO_URI_DEV;
/** The URI used for `MongoDB` connections. */
export const MONGO_URI: string = IS_DEV_MODE ? MONGO_URI_DEV : MONGO_URI_PROD;
