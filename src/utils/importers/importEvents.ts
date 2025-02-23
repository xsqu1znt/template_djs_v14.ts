import { DJSClientEvent } from "@customTypes/events";

import { Client } from "discord.js";
import logger from "@utils/logger";
import jsTools from "jstools";
import path from "node:path";

const EVENT_MODULE_RELATIVE_PATH = "../../events";
const EVENT_MODULE_DIRECTORY = path.join(__dirname, EVENT_MODULE_RELATIVE_PATH);
const EVENT_MODULE_LOG_PATH = "events";

async function importEventModules() {
    let files = jsTools
        .readDir(EVENT_MODULE_DIRECTORY, { recursive: true })
        .filter(fn => fn.endsWith(".js") || fn.endsWith(".ts"));

    // Import the modules found in the given directory
    let modules = await Promise.all(
        files.map(async fn => {
            let _path = path.join(__dirname, EVENT_MODULE_RELATIVE_PATH, fn);
            let _logPath = `./${path.join(EVENT_MODULE_LOG_PATH, fn)}`;
            let _module = await import(_path)
                .then(m => m.__event as DJSClientEvent<any>)
                .catch(err => {
                    // Log the error to the console
                    logger.error("::IMPORT_EVENT", `Failed to import event module at '${_logPath}'`, err);
                    return null;
                });

            return { module: _module, path: _logPath };
        })
    );

    // Filter out modules that failed to import and return
    return modules.filter(m => m.module) as { module: DJSClientEvent<any>; path: string }[];
}

export default async function (client: Client<true>): Promise<void> {
    // Import event files
    let events = await importEventModules();
    if (!events.length) {
        logger.error("::CLIENT", `dir: '${EVENT_MODULE_DIRECTORY}'`, "No event modules found in that directory");
        return;
    }

    // Get an array of every EventType imported
    let eventTypes = jsTools.unique(events.map(e => e.module.event));

    // Group events by EventType
    let eventsGrouped = eventTypes.map(type => events.filter(e => e.module.event === type));

    // Iterate through grouped events
    for (let group of eventsGrouped) {
        // Iterate through events inside the group
        for (let event of group) {
            // Ignore binding events that are disabled
            if (Object.hasOwn(event.module, "enabled") && !event.module.enabled) {
                logger.importer.event(event.module.name, event.path, false);
                continue;
            }

            // Bind it to the appropriate listener
            client.on(event.module.event, async (...args) => {
                try {
                    // Execute the event
                    await event.module.execute.apply(null, [client, ...args]);
                } catch (err) {
                    // Log the error to the console
                    logger.error(
                        "::EVENT",
                        `Failed to execute '${event.module.name}' on event '${event.module.event}'`,
                        err
                    );
                }
            });

            // Log to the console that the event was successfully loaded
            logger.importer.event(event.module.name, event.path, true);
        }
    }
}
