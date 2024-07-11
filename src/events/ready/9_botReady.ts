import { EventCallback } from "@customTypes/events";

import { Client, Events } from "discord.js";
import { name } from "package.json";
import * as logger from "@utils/logger";

export const cb: EventCallback = {
    name: "clientReady",
    eventType: Events.ClientReady,

    execute: async client => {
        logger.success(`${name} successfully connected to Discord`);
    }
};
