import { Message, RepliableInteraction, TextBasedChannel } from "discord.js";

export type SendHandler = RepliableInteraction | TextBasedChannel | Message;

export type SendMethodInteractionBased = "reply" | "editReply" | "followUp";
export type SendMethodChannelBased = "sendInChannel";
export type SendMethodMessageBased = "messageReply" | "messageEdit";
export type SendMethod = SendMethodInteractionBased | SendMethodChannelBased | SendMethodMessageBased;
