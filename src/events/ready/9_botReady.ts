import { DJSClientEvent } from "@customTypes/events";

import logger from "@utils/logger";

export const __event: DJSClientEvent<"ready"> = {
    name: __filename.split(/\.js|\.ts/)[0],
    event: "ready",

    execute: async () => {
        logger.client.online();
    }
};
