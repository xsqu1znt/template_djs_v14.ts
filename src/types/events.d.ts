import { BaseInteraction, Client, ClientEvents, InteractionResponse, Message } from "discord.js";

export interface DJSClientEvent<T extends keyof ClientEvents> {
    /** Name of the event. *Used for error logging.* */
    name: string;
    /** Type of event to bind to the appropriate client event. */
    event: T;
    /** Whether this event will be executed or not. ***Default: true*** */
    enabled?: boolean;
    /** The asyncronous function to be executed. */
    execute: (client: Client<true>, ...args: ClientEvents[T]) => Promise<InteractionResponse, Message | null | void>;
}
