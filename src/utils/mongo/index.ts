import mongoose from "mongoose";
import logger from "@utils/logger";

import { MONGO_URI, IS_DEV_MODE } from "@constants";

/* - - - - - { Models } - - - - - */
export * as models from "@models";

/* - - - - - { Managers } - - - - - */
import guildManager from "./guildManager";
export { guildManager };

/* - - - - - { Meta Functions } - - - - - */
let connection: mongoose.Mongoose | null = null;

/** Connect to MongoDB. */
export async function connect(uri: string = MONGO_URI): Promise<mongoose.Connection | null> {
    if (!uri) {
        logger.error("::MONGO", "MONGO_URI is not set");
        return null;
    }

    if (IS_DEV_MODE && !MONGO_URI) {
        logger.error("::MONGO", "DEV_MODE is enabled, but MONGO_URI_DEV is not set");
        return null;
    }

    try {
        logger.db.mongo.connecting();
        // Create a new connection to MongoDB
        connection = await mongoose.connect(uri);
        // Log success if connected
        if (connection) logger.db.mongo.connected();
    } catch (err) {
        // Log an error if the connection failed
        logger.error("::MONGO", "Couldn't connect to MongoDB", connection);
    }

    return null;
}

/** Close the connection to MongoDB. */
export async function disconnect(): Promise<void> {
    if (!connection) return;
    await connection.disconnect();
}

/** Check response time for MongoDB. */
export async function ping(): Promise<string> {
    if (connection?.connection.readyState !== 1) return "NOT_CONNECTED_TO_MONGO";

    /// Ping the connection database
    let before = Date.now();
    await connection.connection.db?.admin().ping();
    let after = Date.now();

    return (after - before).toString();
}

export default { connection, connect, disconnect, ping };
