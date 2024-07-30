import mongoose from "mongoose";
import logger from "@utils/logger";

import config from "@configs";
import { MONGO_URI, MONGO_URI_DEV, IS_DEV_MODE } from "@index";

import models from "@models";
// import guildManager from "./guildManager";
// import userManager from "./userManager";

export default {
    models,

    // guildManager,
    // userManager,

    /** Connect to MongoDB */
    connect: async (uri = IS_DEV_MODE ? MONGO_URI_DEV : MONGO_URI) => {
        /* - - - - - { Check for MONGO_URI } - - - - - */
        if (IS_DEV_MODE && !MONGO_URI_DEV)
            return logger.error("MONGO_URI Missing", "DEV_MODE is enabled, but MONGO_URI_DEV is not set");
        if (!uri) return logger.error("MONGO_URI Missing", "MONGO_URI is not set");

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
        logger.error("$_TIMESTAMP $_MONGO", "Failed to connect to MongoDB", connection);
    }
};
