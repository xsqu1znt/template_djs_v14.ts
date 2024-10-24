import { BaseInteraction, Client, ClientEvents, InteractionResponse, Message } from "discord.js";

export interface BaseEventModule {
    /** Name of the event. *Used for error logging.* */
    name: string;
    /** Type of event to bind to the appropriate client event. */
    event: keyof ClientEvents;
    /** Whether this event will be executed or not. ***Default: true*** */
    enabled?: boolean;
    /** The asyncrous function to be executed. */
    execute: (client: Client<true>, ...args: any[]) => Promise<Message | void | null>;
}

export interface MessageCreateEventModule extends BaseEventModule {
    execute: (client: Client<true>, message: Message) => Promise<Message | void | null>;
}

export interface InteractionEventModule extends BaseEventModule {
    execute: (client: Client<true>, interaction: BaseInteraction) => Promise<InteractionResponse | Message | void | null>;
}
