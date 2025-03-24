import config from "@configs";

/* - - - - - { CLI } - - - - -  */
const __argsv: string[] = process.argv.slice(2);

export const argsv = {
    GUILD_IDS: (() => {
        const ids = __argsv.find(arg => arg.startsWith("--guild="))?.split(" ");
        return ids?.length ? ids : undefined;
    })(),
    PUSH_COMMANDS_LOCAL: __argsv.includes("--push-local") as boolean,
    REMOVE_COMMANDS_LOCAL: __argsv.includes("--remove-local") as boolean,
    PUSH_COMMANDS_GLOBAL: __argsv.includes("--push-global") as boolean,
    REMOVE_COMMANDS_GLOBAL: __argsv.includes("--remove-global") as boolean
};

/* - - - - - { Environment } - - - - -  */
/** The version of the project. */
export const APP_VERSION: string = process.env.APP_VERSION || config.client.APP_VERSION;

const USING_AUTO_DEV_MODE = process.env.AUTO_DEV_MODE ?? config.client.AUTO_DEV_MODE;
const AUTO_AND_IS_IN_DIST = USING_AUTO_DEV_MODE ? (__dirname.includes("dist") ? true : false) : null;

/** Whether the environment is in development mode. */
export const IN_DEV_MODE =
    AUTO_AND_IS_IN_DIST !== null
        ? !AUTO_AND_IS_IN_DIST // Inversed because if we're not in the dist folder then put us in dev mode
        : process.env.DEV_MODE_OVERRIDE !== undefined
          ? process.env.DEV_MODE_OVERRIDE === "true"
          : (config.client.DEV_MODE_OVERRIDE ?? false);

/* - - - - - { Discord Token } - - - - -  */
const TOKEN_PROD: string = process.env.TOKEN || config.client.TOKEN;
const TOKEN_DEV: string = process.env.TOKEN_DEV || config.client.TOKEN_DEV;
/** The token used to authenticate with `Discord`. */
export const TOKEN: string = IN_DEV_MODE ? TOKEN_DEV : TOKEN_PROD;

/* - - - - - { Mongo URI } - - - - -  */
const MONGO_URI_PROD: string = process.env.MONGO_URI || config.client.MONGO_URI;
const MONGO_URI_DEV: string = process.env.MONGO_URI_DEV || config.client.MONGO_URI_DEV;
/** The URI used for `MongoDB` connections. */
export const MONGO_URI: string = IN_DEV_MODE ? MONGO_URI_DEV : MONGO_URI_PROD;
