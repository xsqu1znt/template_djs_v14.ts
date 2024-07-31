import mongoose from "mongoose";
import logger from "@utils/logger";

import { MONGO_URI, MONGO_URI_DEV, IS_DEV_MODE } from "@index";

import models from "@models";
export * from "@models";

// import guildManager from "./guildManager";
// import userManager from "./userManager";

/** Connect to MongoDB. */
export async function connect(uri: string = IS_DEV_MODE ? MONGO_URI_DEV : MONGO_URI): Promise<void> {
    /* - - - - - { Check for MONGO_URI } - - - - - */
    if (!uri) return logger.error("$_TIMESTAMP $_MONGO", "MONGO_URI is not set");
    if (IS_DEV_MODE && !MONGO_URI_DEV) {
        return logger.error("$_TIMESTAMP $_MONGO", "DEV_MODE is enabled, but MONGO_URI_DEV is not set");
    }

    // Try to connect to MongoDB
    let connection = await new Promise(async (resolve, reject) => {
        return mongoose
            .connect(uri)
            .then(() => resolve(true))
            .catch(err => reject(err));
    });

    // Log the success if connected
    if (connection) return logger.success("Successfully connected to MongoDB");

    // Log the error if the connection failed
    logger.error("$_TIMESTAMP $_MONGO", "Couldn't connect to MongoDB", connection);
}

/** Check response time for MongoDB. */
export async function ping(): Promise<string> {
    if (mongoose.connection.readyState !== 1) return "NOT_CONNECTED_TO_MONGO";

    /// Ping the connection database
    let before = Date.now();
    await mongoose.connection.db.admin().ping();
    let after = Date.now();

    return (after - before).toString();
}

export default {
    models,

    // guildManager,
    // userManager,

    connect,
    ping
};
