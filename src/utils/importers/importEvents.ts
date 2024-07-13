import { EventModule } from "@customTypes/events";

import { Client } from "discord.js";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";
import * as path from "path";

async function importEventModules() {
    let files = jt
        .readDir(path.join(__dirname, "../../events"), { recursive: true })
        .filter(fn => fn.endsWith(".js") || fn.endsWith(".ts"));

    // Import the files found in the given directory
    return await Promise.all(
        files.map(async fn => {
            let _path: string = path.join(__dirname, "../../events", fn);
            let _module: EventModule = (await import(_path)).default;

            return { module: _module, path: path.join("events", fn) };
        })
    );
}

export default async function (client: Client): Promise<void> {
    // Import event files
    let events = await importEventModules();
    if (!events.length) {
        logger.error("[CLIENT] No event modules found", `dir: '${path.join(__dirname, "../../events")}'`);
        return;
    }

    // Get an array of every EventType imported
    let eventTypes = jt.unique(events.map(e => e.module.eventType));

    // Group events by EventType
    let eventsGrouped = eventTypes.map(type => events.filter(e => e.module.eventType === type));

    // Iterate through grouped events
    for (let group of eventsGrouped) {
        // Iterate through events inside the group
        for (let event of group) {
            // Ignore binding events that are disabled
            if (Object.hasOwn(event.module, "enabled") && !event.module.enabled) {
                logger.client.eventBinded(event.module.name, event.path, false);
                continue;
            }

            // Bind it to the appropriate listener
            client.on(event.module.eventType, async (...args) => {
                try {
                    // Execute the event
                    await event.module.execute.apply(null, [client, ...args]);
                } catch (err) {
                    // prettier-ignore
                    // Catch execution errors
                    logger.error("[CLIENT] Failed to execute function", `'${event.module.name}' on event '${event.module.eventType}'`, err);
                }
            });

            // Log to the console that the event was successfully loaded
            logger.client.eventBinded(event.module.name, event.path, true);
        }
    }
}
