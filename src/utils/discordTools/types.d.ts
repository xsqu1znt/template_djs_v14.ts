import { Message, RepliableInteraction, TextBasedChannel } from "discord.js";

export type SendHandler = RepliableInteraction | TextBasedChannel | Message;

export type SendMethodInteractionBased = "reply" | "editReply" | "followUp";
export type SendMethodChannelBased = "sendToChannel";
export type SendMethodMessageBased = "messageReply" | "messageEdit";
export type SendMethod = SendMethodInteractionBased | SendMethodChannelBased | SendMethodMessageBased;
