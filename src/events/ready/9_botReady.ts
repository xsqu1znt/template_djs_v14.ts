import { EventModule } from "@customTypes/events";

import { Client, Events } from "discord.js";
import { name } from "package.json";
import * as logger from "@utils/logger";

export const cb: EventModule = {
    name: "clientReady",
    eventType: Events.ClientReady,

    execute: async (client: Client) => {
        logger.success(`${name} successfully connected to Discord`);
    }
};
