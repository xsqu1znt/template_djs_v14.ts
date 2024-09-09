declare namespace NodeJS {
    interface ProcessEnv {
        /** The token used to authenticate with `Discord`. */
        TOKEN: string;
        /** __(DEV)__ The token used to authenticate with `Discord`. */
        TOKEN_DEV: string;
        /** The URI used for `MongoDB` connections. */
        MONGO_URI: string;
        /** __(DEV)__ The URI used for `MongoDB` connections. */
        MONGO_URI_DEV: string;
        /** Whether the environment is in development mode. */
        DEV_MODE: "true" | "false";
    }
}
