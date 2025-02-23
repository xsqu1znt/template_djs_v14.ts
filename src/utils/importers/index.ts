import { Client } from "discord.js";
import importEvents from "./importEvents";
import importCommands from "./importCommands";
import logger from "@utils/logger";

export default async function (client: Client<true>) {
    await Promise.all([
        importEvents(client).catch(err => logger.error("::IMPORTER", `'importEvents' could not initialize`, err)),
        importCommands(client).catch(err => logger.error("::IMPORTER", `'importCommands' could not initialize`, err))
    ]);
}
