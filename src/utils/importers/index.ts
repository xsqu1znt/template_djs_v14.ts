import { Client } from "discord.js";
import * as importEvents from "./importEvents";
import * as importCommands from "./importCommands";
import logger from "@utils/logger";

export default async function (client: Client) {
    await Promise.all([
        importEvents
            .default(client)
            .catch(err => logger.error("$_TIMESTAMP $_IMPORTER", `'importEvents' could not initialize`, err)),

        importCommands
            .default(client)
            .catch(err => logger.error("$_TIMESTAMP $_IMPORTER", `'importCommands' could not initialize`, err))
    ]);
}
