import { EventModule } from "@customTypes/events";

import { Client, Events } from "discord.js";
import * as logger from "@utils/logger";

export default {
    name: "clientReady",
    eventType: Events.ClientReady,

    execute: async (client: Client) => {
        logger.client.online();
    }
} as EventModule;
