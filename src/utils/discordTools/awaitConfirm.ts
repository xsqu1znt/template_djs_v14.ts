import { SendHandler, EmbedResolveable, UserResolvable } from "./types";

interface AwaitConfirmOptions extends Omit<DynaSendOptions, "embeds" | "components" | "deleteAfter" | "fetchReply"> {
    /** The users that are allowed to interact with the message. */
    allowedParticipants: UserResolvable | UserResolvable[];
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

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

import dynaSend, { DynaSendOptions } from "./dynaSend";
import BetterEmbed from "./BetterEmbed";
import logger from "@utils/logger";
import jt from "@utils/jsTools";

import config from "./config.json";

/** Send a confirmation message and await the user's response.

 * This function utilizes {@link BetterEmbed} and {@link dynaSend}. */
export default async function awaitConfirm(handler: SendHandler, options: AwaitConfirmOptions): Promise<boolean> {
    const _options = {
        onResolve: {
            deleteOnConfirm: true,
            deleteOnCancel: true,
            disableComponents: false
        },
        ...options,
        allowedParticipants: jt.forceArray(options.allowedParticipants),
        timeout: jt.parseTime(options.timeout || config.timeouts.CONFIRMATION)
    };

    /* error prevention ( START ) */
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
            : _options.embed === null
            ? undefined
            : _options.embed;

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

    /* - - - - - { Await the User's Decision } - - - - - */
    const cleanUp = async (resolve: (value: boolean) => void, confirmed: boolean) => {
        // Delete the message ( CONFIRM )
        if (confirmed && _options.onResolve.deleteOnConfirm) {
            if (message?.deletable) await message.delete().catch(null);
        }
        // Delete the message ( CANCEL )
        if (!confirmed && _options.onResolve.deleteOnCancel) {
            if (message?.deletable) await message.delete().catch(null);
        }

        // Return and resolve the promise since the message was deleted
        if (_options.onResolve.deleteOnConfirm || _options.onResolve.deleteOnCancel) return resolve(confirmed);

        // Disable the components
        if (_options.onResolve.disableComponents) {
            buttons.cancel.setDisabled(true);
            buttons.confirm.setDisabled(true);
            await message?.edit({ components: [actionRow] }).catch(null);

            // Resolve the promise
            return resolve(confirmed);
        }
    };

    // Map the allowed participants to their IDs
    const allowedParticipantIds = _options.allowedParticipants.map(m => (typeof m === "string" ? m : m.id));

    return new Promise(async resolve => {
        const executeAction = async (customId: string) => {
            switch (customId) {
                case "btn_confirm":
                    return await cleanUp(resolve, true);

                case "btn_cancel":
                    return await cleanUp(resolve, false);

                default:
                    return await cleanUp(resolve, false);
            }
        };

        // Wait for the next button interaction
        await message
            .awaitMessageComponent({
                filter: i => allowedParticipantIds.includes(i.user.id) && ["btn_confirm", "btn_cancel"].includes(i.customId),
                componentType: ComponentType.Button,
                time: _options.timeout
            })
            .then(async i => {
                await i.deferUpdate().catch(null);
                executeAction(i.customId);
            })
            .catch(() => executeAction("btn_cancel"));
    });
}
