import { BaseEventModule } from "@customTypes/events";

import logger from "@utils/logger";

export default {
    name: "clientReady",
    event: "ready",

    execute: async (client) => {
        logger.client.online();
    }
} as BaseEventModule;
