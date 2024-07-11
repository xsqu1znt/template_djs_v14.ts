import { Client } from "discord.js";
import * as importEvents from "./importEvents";
import * as logger from "@utils/logger";

export async function init(client: Client) {
    await importEvents
        .default(client)
        .catch(err => logger.error("[CLIENT] Importer failed", `'importEvents' could not initialize`, err));
}
