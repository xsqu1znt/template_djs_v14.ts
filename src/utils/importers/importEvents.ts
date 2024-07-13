import { EventModule, EventModuleExport } from "@customTypes/events";

import { Client } from "discord.js";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";
import * as path from "path";

async function importEventModules() {
    let files = jt.readDir(path.join(__dirname, "../../events"), { recursive: true });

    // Import the files found in the given directory
    let events: EventModule[] = ((await Promise.all(files.map(fn => import(`../../events/${fn}`)))) as EventModuleExport[])
        // Destructure the imported event to get the callback
        .map(e => e.default);

    // Filter out files that don't have an eventType property or is disabled
    events.filter(f => f.eventType !== undefined && f.enabled !== false);
    return events;
}

export default async function (client: Client) {
    // Import event files
    let events = await importEventModules();
    if (!events.length) logger.error("[CLIENT]: No event modules found", `dir: '${path.join(__dirname, "../../events")}'`);

    // Get an array of every EventType
    let eventTypes = jt.unique(events.map(e => e.eventType));

    // Group events by EventType
    let eventsGrouped = eventTypes.map(type => events.filter(e => e.eventType === type));

    // Iterate through grouped events
    for (let group of eventsGrouped) {
        // Iterate through events inside the group
        for (let event of group) {
            try {
                // Bind it to the appropriate listener
                client.on(event.eventType, async (...args) => {
                    try {
                        // Execute the event
                        await event.execute.apply(null, [client, ...args]);
                    } catch (err) {
                        // prettier-ignore
                        // Catch execution errors
                        logger.error("[CLIENT] Failed to execute function", `'${event.name}' on event '${event.eventType}'`, err);
                    }
                });
            } catch (err) {
                // prettier-ignore
                // Invalid event type recieved
                logger.error("[CLIENT] Failed to bind event", `invalid event: '${event.eventType}' for function '${event.name}'`, err);
            }
        }
    }
}
