import { SendMethod } from "./types";

interface DynaSendOptions {
    /** Handler used to send the message.
     *
     * The type of handler depends on the `SendMethod` you choose to use.
     *
     * ___1.___ `BaseInteraction`: required for `Interaction` based `SendMethods`
     *
     * ___2.___ `Channel`: required for the "sendToChannel" `SendMethod`
     *
     * ___3.___ `Message`: required for `Message` based `SendMethods` */
    handler: BaseInteraction | BaseChannel | Message;
    /** Text content to send in the message. */
    content?: string;
    /** Embeds to send with the message. */
    embeds?: EmbedBuilder | EmbedBuilder[] /* | BetterEmbed | BetterEmbed[] */;
    /** Components to send with the message. */
    components?: ActionRowBuilder | ActionRowBuilder[];
    /** Mention types allowed for the message. */
    allowedMentions?: MessageMentionOptions;
    /** The method used to send the message.
     *
     * Defaults based on the `handler` type:
     *
     * ___1.___ `BaseInteraction`: "reply" _(uses "editReply" if an interaction cannot be replied)_
     *
     * ___2.___ `Channel`: "sendToChannel"
     *
     * ___3.___ `Message`: "messageReply" */
    sendMethod?: SendMethod;
    /** If the message should be ephemeral. _This only works for the "reply" `SendMethod`._ */
    ephemeral?: boolean;
    /** An amount of time to wait in __milliseconds__ before deleting the message.
     *
     * This option also utilizes `@utils/jsTools.parseTime()`, letting you use "10s" or "1m 30s" instead of a number. */
    deleteAfter?: number | string;
    /** If the `Message` object is returned after sending. _`true` by default._ */
    fetchReply?: boolean;
}

import { ActionRowBuilder, BaseChannel, BaseInteraction, EmbedBuilder, Message, MessageMentionOptions } from "discord.js";
// import * as deleteMessageAfter from "./deleteMessageAfter";
// import * as BetterEmbed from "./betterEmbed";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";

export async function dynaSend(options: DynaSendOptions) {
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

        /* Ensure all arrays are arrays */
        embeds: jt.forceArray(options.embeds, { filterFalsey: true }),
        components: jt.forceArray(options.components, { filterFalsey: true }),

        // Fixes a bug with allowed mention not being applied properly
        allowedMentions: {
            parse: undefined,
            repliedUser: true,
            roles: undefined,
            users: undefined,
            ...options.allowedMentions
        }
    };
}
