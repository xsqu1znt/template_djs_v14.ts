import { SendMethod, DynaSendInteractionBased, DynaSendChannelBased, DynaSendMessageBased } from "./types";

interface DynaSendOptions {
    /** Text content to send in the message. */
    content?: string;
    /** Embeds to send with the message. */
    embeds?: EmbedBuilder | EmbedBuilder[] /* | BetterEmbed | BetterEmbed[] */;
    /** Components to send with the message. */
    components?: ActionRowBuilder | ActionRowBuilder[];
    /** Mention types allowed for the message. */
    allowedMentions?: MessageMentionOptions;
    /** If the message should be ephemeral. _This only works for the "reply" `SendMethod`._ */
    ephemeral?: boolean;
    /** An amount of time to wait in __milliseconds__ before deleting the message.
     *
     * This option also utilizes `@utils/jsTools.parseTime()`, letting you use "10s" or "1m 30s" instead of a number. */
    deleteAfter?: number | string;
    /** If the `Message` object is returned after sending. _`true` by default._ */
    fetchReply?: boolean;
}

import {
    ActionRowBuilder,
    BaseChannel,
    BaseGuildTextChannel,
    BaseInteraction,
    CommandInteraction,
    EmbedBuilder,
    Message,
    MessageMentionOptions,
    TextChannel
} from "discord.js";
// import * as deleteMessageAfter from "./deleteMessageAfter";
// import * as BetterEmbed from "./betterEmbed";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";
import { Channel } from "diagnostics_channel";

export async function dynaSend(handler: CommandInteraction, options: DynaSendInteractionBased): Promise<Message | null>;
export async function dynaSend(handler: CommandInteraction | TextChannel | Message, options: DynaSendMessageBased): Promise<Message | null> {
    options = {
        ...{
            handler: undefined,
            content: "",
            embeds: [],
            components: [],
            allowedMentions: {},
            sendMethod: "reply",
            ephemeral: false,
            deleteAfter: 0,
            fetchReply: true
        },
        ...options,

        /* Ensure all arrays are, well, arrays */
        embeds: options.embeds ? jt.forceArray(options.embeds, { filterFalsey: true }) : [],
        components: options.components ? jt.forceArray(options.components, { filterFalsey: true }) : [],

        // Fixes a bug with allowed mention not being applied properly
        allowedMentions: {
            parse: undefined,
            repliedUser: true,
            roles: undefined,
            users: undefined,
            ...options.allowedMentions
        }
    };

    /* - - - - - { Error Checking } - - - - - */
    /* if (["messageReply", "messageEdit"].includes(options.sendMethod as string) && options.handler! instanceof Message) {
        throw new TypeError("[DynaSend]", { cause: "handler is not a 'Message' based" });
    } */
}
