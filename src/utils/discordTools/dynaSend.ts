import { EmbedResolveable, SendHandler, SendMethod } from "./types";

export interface DynaSendOptions {
    /** The method used to send the message.
     *
     * Defaults based on the `handler` type:
     *
     * ___1.___ `RepliableInteraction`: "reply" _(uses "editReply" if an interaction cannot be replied)_
     *
     * ___2.___ `TextBasedChannel`: "sendInChannel"
     *
     * ___3.___ `Message`: "messageReply"
     *
     * ___3.___ `GuildMember` | `User`: "dmUser" */
    sendMethod?: SendMethod;
    /** Text content to send in the message. */
    content?: string;
    /** Embeds to send with the message. */
    embeds?: EmbedResolveable | EmbedResolveable[];
    /** Components to send with the message. */
    components?: ActionRowBuilder<MessageActionRowComponentBuilder> | ActionRowBuilder<MessageActionRowComponentBuilder>[];
    /** Mention types allowed for the message. */
    allowedMentions?: MessageMentionOptions;
    /** If the message should be ephemeral. _This only works for the "reply" and "followUp" `SendMethod`._ */
    ephemeral?: boolean;
    /** An amount of time to wait in __milliseconds__ before deleting the message.
     *
     * This option also utilizes `@utils/jsTools.parseTime()`, letting you use "10s" or "1m 30s" instead of a number. */
    deleteAfter?: number | string;
    /** If the `Message` data is returned after replying to or editing an `Interaction`. _`true` by default._ */
    fetchReply?: boolean;
}

import {
    ActionRowBuilder,
    BaseChannel,
    BaseInteraction,
    GuildMember,
    Message,
    MessageActionRowComponentBuilder,
    MessageMentionOptions,
    RepliableInteraction,
    TextBasedChannel,
    User
} from "discord.js";
import deleteMessageAfter from "./deleteMessageAfter";
import logger from "@utils/logger";
import jt from "@utils/jsTools";

export default async function dynaSend(handler: SendHandler, options: DynaSendOptions): Promise<Message | null> {
    let _options = {
        ...{
            content: "",
            embeds: [],
            components: [],
            allowedMentions: {},
            ephemeral: false,
            deleteAfter: 0,
            fetchReply: true
        },
        ...options,

        sendMethod:
            options.sendMethod ??
            /* defaults */
            handler instanceof BaseInteraction
                ? "reply"
                : handler instanceof BaseChannel
                ? "sendInChannel"
                : handler instanceof Message
                ? "messageReply"
                : handler instanceof GuildMember || handler instanceof User
                ? "dmUser"
                : "reply",

        /* Ensure all arrays are, well, arrays */
        embeds: options.embeds ? jt.forceArray(options.embeds, { filterFalsey: true }) : [],
        components: options.components ? jt.forceArray(options.components, { filterFalsey: true }) : [],

        // Fixes a bug with allowed mention not being applied properly
        allowedMentions: {
            parse: undefined,
            repliedUser: true,
            roles: undefined,
            users: undefined,
            ...(options.allowedMentions || {})
        }
    };

    // Parse deleteAfter time
    _options.deleteAfter = jt.parseTime(_options.deleteAfter as string | number);

    /* - - - - - { Error Checking } - - - - - */
    console.log(_options.sendMethod);
    if (_options.sendMethod) {
        if (!(handler instanceof BaseInteraction) && ["reply", "editReply", "followUp"].includes(_options.sendMethod))
            throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'handler' is not 'Interaction' based" });

        if (!(handler instanceof BaseChannel) && ["sendInChannel"].includes(_options.sendMethod))
            throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'handler' is not 'Channel' based" });

        if (!(handler instanceof Message) && ["messageReply", "messageEdit"].includes(_options.sendMethod))
            throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'handler' is not 'Message' based" });

        if (!(handler instanceof GuildMember || handler instanceof User) && ["dmUser"].includes(_options.sendMethod))
            throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'handler' is not 'User' based" });

        // Ephemeral fallback
        if (["reply", "followUp"].includes(_options.sendMethod) && _options.ephemeral) {
            logger.log("[DynaSend] Ephemeral can only be used with the 'reply' SendMethod");
            _options.ephemeral = false;
        }

        // Interaction "editReply" fallback
        if (handler instanceof BaseInteraction && _options.sendMethod === "reply" && handler.replied)
            _options.sendMethod = "editReply";
    } else throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'sendMethod' cannot be null or undefined" });

    if (_options.deleteAfter && (_options.deleteAfter as number) < 1000)
        logger.debug("[DynaSend] 'deleteAfter' is less than 1 second; is this intentional?");

    /* - - - - - { Send the Message } - - - - - */
    let message: Message | null = null;

    // Create the send data object
    let sendData = {
        content: _options.content,
        embeds: _options.embeds.map(e => e.toJSON()),
        components: _options.components,
        allowedMentions: _options.allowedMentions,
        ephemeral: _options.ephemeral
    };

    // Send the message based on the sendMethod
    switch (_options.sendMethod) {
        case "reply":
            let _reply = await (handler as RepliableInteraction)
                .reply(sendData)
                .catch(err => logger.error("$_TIMESTAMP [DYNASEND]", "REPLY_TO_INTERACTION | SendMethod: 'reply'", err));
            let _replyInGuild = (handler as RepliableInteraction).inGuild();
            message = _options.fetchReply && _replyInGuild && _reply ? await _reply.fetch() : null;
            break;

        case "editReply":
            let _editReply = await (handler as RepliableInteraction)
                .editReply(sendData)
                .catch(err => logger.error("$_TIMESTAMP [DYNASEND]", "EDIT_INTERACTION | SendMethod: 'editReply'", err));
            let _editReplyInGuild = (handler as RepliableInteraction).inGuild();
            message = _options.fetchReply && _editReplyInGuild && _editReply ? await _editReply.fetch() : null;
            break;

        case "followUp":
            let _followUp = await (handler as RepliableInteraction)
                .followUp({ ...sendData, fetchReply: _options.fetchReply })
                .catch(err => logger.error("$_TIMESTAMP [DYNASEND]", "FOLLOW_UP_INTERACTION | SendMethod: 'followUp'", err));
            let _followUpInGuild = (handler as RepliableInteraction).inGuild();
            message = _options.fetchReply && _followUpInGuild && _followUp ? _followUp : null;
            break;

        case "sendInChannel":
            message = await (handler as TextBasedChannel | GuildMember | User).send(sendData).catch(err => {
                logger.error("$_TIMESTAMP [DYNASEND]", "SEND_IN_CHANNEL | SendMethod: 'sendInChannel'", err);
                return null;
            });
            break;

        case "messageReply":
            message = await (handler as Message).reply(sendData).catch(err => {
                logger.error("$_TIMESTAMP [DYNASEND]", "REPLY_TO_MESSAGE | SendMethod: 'messageReply'", err);
                return null;
            });
            break;

        case "messageEdit":
            // Check if the message can be edited
            if (!(handler as Message).editable) {
                logger.log("[DYNASEND] Message cannot be edited");
                break;
            }
            message = await (handler as Message).edit(sendData).catch(err => {
                logger.error("$_TIMESTAMP [DYNASEND]", "EDIT_MESSAGE | SendMethod: 'messageEdit'", err);
                return null;
            });
            break;

        case "dmUser":
            message = await (handler as GuildMember | User).send(sendData).catch(err => {
                logger.error("$_TIMESTAMP [DYNASEND]", "DM_USER | SendMethod: 'dmUser'", err);
                return null;
            });
            break;

        default:
            throw new TypeError("[DynaSend] Invalid SendMethod", { cause: "'sendMethod' is not defined" });
    }

    // Delete the message after the given delay
    if (_options.deleteAfter && message) return await deleteMessageAfter(message, _options.deleteAfter);

    return message;
}
