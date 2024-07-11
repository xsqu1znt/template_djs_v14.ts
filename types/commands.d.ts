import { BaseInteraction, Client, ClientEvents, Message } from "discord.js";

export type InteractionBasedEventCallback = (client: Client, interaction: BaseInteraction) => Promise<Message> | void | null;
export type MessageBasedEventCallback = (client: Client, message: Message) => Promise<Message> | void | null;
