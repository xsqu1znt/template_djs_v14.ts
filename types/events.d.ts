import { ClientEvents } from "discord.js";

export interface EventCallback {
    /** The name of the event. *Used for error logging.* */
    name: string;
    /** The type of event to bind to the appropriate client event. */
    eventType: keyof ClientEvents;
    /** Whether this event will be executed or not. ***Default: true*** */
    enabled?: boolean;
    /** The asyncrous function to be executed. */
    execute: Function;
}
