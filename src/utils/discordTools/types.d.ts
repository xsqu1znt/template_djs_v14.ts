import { CacheType, CommandInteraction, EmbedBuilder, GuildMember, Message, RepliableInteraction, TextBasedChannel, User } from "discord.js";
import BetterEmbed from "./BetterEmbed";

export type SendHandler = CommandInteraction | RepliableInteraction | TextBasedChannel | Message;

export type SendMethodInteractionBased = "reply" | "editReply" | "followUp";
export type SendMethodChannelBased = "sendInChannel";
export type SendMethodMessageBased = "messageReply" | "messageEdit";
export type SendMethod = SendMethodInteractionBased | SendMethodChannelBased | SendMethodMessageBased;

export type EmbedResolveable = EmbedBuilder | BetterEmbed;
export type InteractionResolveable = CommandInteraction | RepliableInteraction;
export type UserResolvable = GuildMember | User | string;