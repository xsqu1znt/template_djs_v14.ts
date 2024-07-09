type InteractionBasedEventCallback = (client: Client, interaction: BaseInteraction) => Promise<Message> | void | null;
type MessageBasedEventCallback = (client: Client, message: Message) => Promise<Message> | void | null;
type AnyOtherEventBasedCallback = (client: Client, ...args: any) => Promise<Message> | void | null;

interface EventCallback {
    /** The name of the event. *Used for error logging.* */
    name: string;
    /** The type of event to bind to the appropriate client event. */
    eventType: keyof ClientEvents;
    /** Whether this event will be executed or not. ***Default: true*** */
    enabled?: boolean;
    /** The asyncrous function to be executed. */
    execute: InteractionBasedEventCallback | MessageBasedEventCallback | AnyOtherEventBasedCallback;
}

import { BaseInteraction, Client, ClientEvents, Message } from "discord.js";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";

async function importEvents(path: string) {
    let files = jt.readDir(path, { recursive: true }).filter(fn => fn.endsWith(".ts"));

    // Import the files found in the given directory
    let events: EventCallback[] = await Promise.all(files.map(fn => import(`../.${path}/${fn}`)));

    // Filter out files that don't have an eventType property or is disabled
    events.filter(f => f.eventType !== undefined && f.enabled !== false);

    return events;
}

export default async function (client: Client) {
    const directoryPath = "./events";

    // Import event files
    let events = await importEvents(directoryPath);
    if (!events.length) logger.debug(`No events found in '${directoryPath}'`);

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
                        event.execute.apply(null, [client, ...args]);
                    } catch (err) {
                        // Catch execution errors
                        logger.error("Failed to execute function", `\'${event.name}\' on event \'${event.eventType}\'`, err);
                    }
                });
            } catch (err) {
                // prettier-ignore
                // Invalid event type recieved
                logger.error("Failed to bind event", `invalid event: \'${event.eventType}\' for function \'${event.name}\'`, err);
            }
        }
    }
}
