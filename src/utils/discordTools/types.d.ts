import {
    CacheType,
    CommandInteraction,
    DMChannel,
    EmbedBuilder,
    GuildMember,
    Message,
    NewsChannel,
    RepliableInteraction,
    TextBasedChannel,
    TextChannel,
    ThreadChannel,
    User
} from "discord.js";
import BetterEmbed from "./BetterEmbed";

export type SendHandler = CommandInteraction | RepliableInteraction | TextBasedChannel | Message | GuildMember | User;

export type SendMethodInteractionBased = "reply" | "editReply" | "followUp";
export type SendMethodChannelBased = "sendInChannel";
export type SendMethodMessageBased = "messageReply" | "messageEdit";
export type SendMethodUserBased = "dmUser";
export type SendMethod = SendMethodInteractionBased | SendMethodChannelBased | SendMethodMessageBased | SendMethodUserBased;

export type EmbedResolveable = EmbedBuilder | BetterEmbed;
export type InteractionResolveable = CommandInteraction | RepliableInteraction;
export type UserResolvable = GuildMember | User | string;

export type SendableTextChannel = DMChannel | TextChannel | NewsChannel | ThreadChannel;
