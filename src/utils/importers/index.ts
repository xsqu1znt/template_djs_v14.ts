import { Client } from "discord.js";
import * as importEvents from "./importEvents";
import * as importCommands from "./importCommands";
import * as logger from "@utils/logger";

export async function init(client: Client) {
    await Promise.all([
        importEvents
            .default(client)
            .catch(err => logger.error("[CLIENT] Importer failed", `'importEvents' could not initialize`, err)),

        importCommands
            .default(client)
            .catch(err => logger.error("[CLIENT] Importer failed", `'importCommands' could not initialize`, err))
    ]);
}
