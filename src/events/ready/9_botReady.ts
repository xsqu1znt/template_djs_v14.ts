import { EventModule } from "@customTypes/events";

import { Client, Events } from "discord.js";
import * as logger from "@utils/logger";

import { name as PROJECT } from "@pkgJSON";

export default {
    name: "clientReady",
    eventType: Events.ClientReady,

    execute: async (client: Client) => {
        logger.success(`${PROJECT} successfully connected to Discord`);
    }
} as EventModule;
