import { BaseEventModule } from "@customTypes/events";

import logger from "@utils/logger";

export const __event: BaseEventModule = {
    name: "clientReady",
    event: "ready",

    execute: async () => {
        logger.client.online();
    }
};
