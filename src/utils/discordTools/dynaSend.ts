import { SendHandler, SendMethod, SendMethodMessageBased } from "./types";

interface DynaSendOptions {
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
    BaseInteraction,
    EmbedBuilder,
    Message,
    MessageMentionOptions,
    TextChannel
} from "discord.js";
// import * as deleteMessageAfter from "./deleteMessageAfter";
// import * as BetterEmbed from "./betterEmbed";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";

export async function dynaSend(handler: SendHandler, options: DynaSendOptions): Promise<Message | null> {
    options = {
        ...{
            content: "",
            embeds: [],
            components: [],
            allowedMentions: {},
            sendMethod:
                // defaults
                handler instanceof BaseInteraction
                    ? "reply"
                    : handler instanceof BaseChannel
                    ? "sendToChannel"
                    : handler instanceof Message
                    ? "messageReply"
                    : "reply",
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
    if (options.sendMethod) {
        if (["reply", "editReply", "followUp"].includes(options.sendMethod) && !(handler instanceof BaseInteraction))
            throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'handler' is not 'Interaction' based" });

        if (["sendToChannel"].includes(options.sendMethod) && !(handler instanceof BaseChannel))
            throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'handler' is not 'Channel' based" });

        if (["messageReply", "messageEdit"].includes(options.sendMethod) && !(handler instanceof Message))
            throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'handler' is not 'Message' based" });
    } else throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'sendMethod' cannot be null or undefined" });
}
