import { DJSClientEvent } from "@customTypes/events";

import logger from "@utils/logger";

export const __event: DJSClientEvent<"ready"> = {
    name: __filename.split("/").pop()!.split(".")[0],
    event: "ready",

    execute: async () => {
        logger.client.online();
    }
};
