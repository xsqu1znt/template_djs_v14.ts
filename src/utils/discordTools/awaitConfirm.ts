import { SendHandler, SendMethod, EmbedResolveable } from "./types";

interface AwaitConfirmOptions extends Omit<DynaSendOptions, "embeds" | "components" | "deleteAfter" | "fetchReply"> {
    /** The user or users that are allowed to interact with the navigator. */
    allowedParticipants: GuildMember | User | Array<GuildMember | User>;
    /** The embed or embed configuration to send. Set to `null` to not send an embed. */
    embed?: EmbedResolveable | null;
    /** How long to wait before timing out. Use `null` to never timeout.
     *
     * Defaults to `timeouts.CONFIRMATION`. Configure in `./config.json`.
     *
     * This option also utilizes {@link jt.parseTime}, letting you use "10s" or "1m 30s" instead of a number. */
    timeout?: number | string | null;
    onResolve?: {
        /** Delete the message after the `confirm` button is pressed. Default is `true`. */
        deleteOnConfirm?: boolean;
        /** Delete the message after the `cancel` button is pressed. Default is `true`. */
        deleteOnCancel?: boolean;
        /** Disable the components instead of removing them. Default is `false`. */
        disableComponents?: boolean;
    };
}

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, GuildMember, Message, User } from "discord.js";

import deleteMessageAfter from "./deleteMessageAfter";
import BetterEmbed from "./BetterEmbed";
import logger from "@utils/logger";
import dynaSend, { DynaSendOptions } from "./dynaSend";
import jt from "@utils/jsTools";

import config from "./config.json";

/** Send a confirmation message and await the user's response.

 * This function utilizes {@link BetterEmbed}. */
export default async function awaitConfirm(handler: SendHandler, options: AwaitConfirmOptions) {
    const _options = {
        ...options,
        allowedParticipants: jt.forceArray(options.allowedParticipants),
        timeout: jt.parseTime(options.timeout || config.timeouts.CONFIRMATION),
        onResolve: {
            deleteOnConfirm: true,
            deleteOnCancel: true,
            disableComponents: false
        }
    };

    /* error prevention ( START ) */
    if (!_options.content && !_options.embed) {
        throw new Error("[AwaitConfirm]: You must provide either `content` or an `embed` to send the message.");
    }

    if (_options.timeout < 1000) {
        logger.debug("[AwaitConfirm]: 'timeout' is less than 1 second; Is this intentional?");
    }
    /* error prevention ( END ) */

    /* - - - - - { Configure the Embed } - - - - - */
    const embed =
        _options.embed === undefined
            ? new BetterEmbed({
                  title: config.await_confirm.DEFAULT_EMBED_TITLE,
                  description: config.await_confirm.DEFAULT_EMBED_DESCRIPTION
              })
            : undefined;

    /* - - - - - { Action Row  } - - - - - */
    const buttons = {
        confirm: new ButtonBuilder({ label: "Confirm", style: ButtonStyle.Success, custom_id: "btn_confirm" }),
        cancel: new ButtonBuilder({ label: "Cancel", style: ButtonStyle.Danger, custom_id: "btn_cancel" })
    };

    const actionRow = new ActionRowBuilder<ButtonBuilder>({ components: [buttons.confirm, buttons.cancel] });

    /* - - - - - { Send the Message } - - - - - */
    const message = await dynaSend(handler, {
        content: _options.content,
        embeds: embed,
        allowedMentions: _options.allowedMentions,
        components: actionRow,
        sendMethod: _options.sendMethod,
        ephemeral: _options.ephemeral
    });

    // Cancel if the message failed to send
    if (!message) return false;

    /* - - - - - { Send the Message } - - - - - */
    const cleanUp = async (confirmed: boolean) => {
        // Delete the message ( CONFIRM )
        if (confirmed && _options.onResolve.deleteOnConfirm) {
            if (message?.deletable) await message.delete().catch(null);
        }
        // Delete the message ( CANCEL )
        if (!confirmed && _options.onResolve.deleteOnCancel) {
            if (message?.deletable) await message.delete().catch(null);
        }

        // Return regardless since the message was deleted
        if (_options.onResolve.deleteOnConfirm || _options.onResolve.deleteOnCancel) return;

        // Disable the components
        if (_options.onResolve.disableComponents) {
            buttons.cancel.setDisabled(true);
            buttons.confirm.setDisabled(true);
            await message?.edit({ components: [actionRow] }).catch(null);
        }
    };

    const allowedParticipantIds = _options.allowedParticipants.map(m => m.id);

    return new Promise(async resolve => {
        // Create the collector
        const res = await message.awaitMessageComponent({
            filter: i => allowedParticipantIds.includes(i.user.id) && ["btn_confirm", "btn_cancel"].includes(i.customId),
            componentType: ComponentType.Button,
            time: _options.timeout
        });

        switch (res?.customId) {
            case "btn_confirm":
                await cleanUp(true);
                return resolve(true);

            case "btn_cancel":
                await cleanUp(false);
                return resolve(false);

            default:
                await cleanUp(false);
                return resolve(false);
        }
    });
}
