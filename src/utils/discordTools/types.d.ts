/** The method used to send the message.
 *
 * Defaults based on the `handler` type:
 *
 * ___1.___ `BaseInteraction`: "reply" _(uses "editReply" if an interaction cannot be replied)_
 *
 * ___2.___ `Channel`: "sendToChannel"
 *
 * ___3.___ `Message`: "messageReply" */
import { BaseInteraction, Channel, Message } from "discord.js";

type SendMethod_InteractionBased = "reply" | "editReply" | "followUp";
type SendMethod_ChannelBased = "sendToChannel";
type SendMethod_MessageBased = "messageReply" | "messageEdit";

type SendMethod = SendMethod_InteractionBased | SendMethod_ChannelBased | SendMethod_MessageBased;

interface DynaSendBaseOptions {
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

interface DynaSendInteractionBased extends DynaSendBaseOptions {
    sendMethod?: SendMethod_InteractionBased;
}

interface DynaSendChannelBased extends DynaSendBaseOptions {
    sendMethod?: SendMethod_ChannelBased;
}

interface DynaSendMessageBased extends DynaSendBaseOptions {
    sendMethod?: SendMethod_MessageBased;
}
