interface BetterEmbedData {
    /** Can be provided for automated context formatting. */
    context?: {
        interaction?: RepliableInteraction | null;
        channel?: TextBasedChannel | null;
        message?: Message | null;
    } | null;

    /** Author of the `Embed`. */
    author?: string | BetterEmbedAuthor | null;
    /** Title of the `Embed`. */
    title?: string | BetterEmbedTitle | null;
    /** Thumbnail to be displayed on the top right of the `Embed`. */
    thumbnailURL?: string | null;
    /** Text to be displayed inside of the `Embed`. */
    description?: string | null;
    /** Image to be displayed inside of the `Embed`. */
    imageURL?: string | null;
    /** Footer to be displayed at the bottom of the `Embed`. */
    footer?: string | BetterEmbedFooter | null;
    /** Fields of the `Embed`. */
    fields?: APIEmbedField[] | null;
    /** Color of the `Embed`. */
    color?: string | string[] | null;
    /** The timestamp to be displayed to the right of the `Embed`'s footer.
     *
     * If set to `true`, will use the current time. */
    timestamp?: string | number | boolean | Date | null;

    /** If `true`, will disable automatic context formatting for this `Embed`. */
    disableAutomaticContext?: boolean;
}

interface BetterEmbedAuthor {
    /** A user that will be used for automatic context formatting.
     *
     * __NOTE:__ There is no reason to provide this unless:
     *
     * ___1.___ `BetterEmbed.context` was not provided upon creation, or the given context was a `TextBasedChannel`.
     *
     * ___2.___ The `.user` of `BetterEmbed.context` is different from who you want ACF to target. */
    context?: GuildMember | User | null;
    /** Text to be displayed. */
    text: string;
    /** Icon to be displayed on the top left of the `Embed`.
     *
     * If `context` is provided, can be set to `true` to use the context user's avatar. */
    icon?: string | boolean | null;
    /** If provided, will turn the author's text into a hyperlink. */
    hyperlink?: string | null;
}

interface BetterEmbedTitle {
    /** Text to be displayed. */
    text: string;
    /** If provided, will turn the title's text into a hyperlink. */
    hyperlink?: string | null;
}

interface BetterEmbedFooter {
    /** Text to be displayed. */
    text: string;
    /** Icon to be displayed on the bottom left of the `Embed`.
     *
     * If `context` is provided, can be set to `true` to use the context user's avatar. */
    icon?: string | boolean | null;
}

import { APIEmbedField, EmbedBuilder, GuildMember, Message, RepliableInteraction, TextBasedChannel, User } from "discord.js";
import { dynaSend } from "./dynaSend";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";

import { EMBED_COLOR, EMBED_COLOR_DEV } from "./config.json";
import * as config from "@configs";

import { IS_DEV_MODE } from "@index";

/** A better version of the classic `EmbedBuilder`.
 *
 * /// Author:
 * - __`$USER`__: *author's mention (@xsqu1znt)*
 * - __`$USER_NAME`__: *author's username*
 * - __`$DISPLAY_NAME`__: *author's display name (requires `GuildMember` context)*
 * - __`$USER_AVATAR`__: *author's avatar*
 *
 * /// General:
 * - __`$BOT_AVATAR`__: *bot's avatar (requires `RepliableInteraction` or `Message` context)*
 * - __`$INVIS`__: *invisible character for fields*
 *
 * - __`$YEAR`__: *YYYY*
 * - __`$MONTH`__: *MM*
 * - __`$DAY`__: *DD*
 * - __`$year`__: *YY*
 * - __`$month`__: *M or MM*
 * - __`$day`__: *D or DD*
 *
 * All functions utilize automatic context formatting, unless `disableAutomaticContext` is set to `true`.
 *
 * __NOTE__: Use a blackslash `\` to escape any context. */
export class BetterEmbed {
    #embed = new EmbedBuilder();

    data: BetterEmbedData = {
        context: { interaction: null, channel: null, message: null },
        author: { context: null, text: "", icon: null, hyperlink: null },
        title: { text: "", hyperlink: null },
        thumbnailURL: null,
        imageURL: null,
        description: null,
        footer: { text: "", icon: null },
        color: jt.choice(IS_DEV_MODE ? EMBED_COLOR_DEV : EMBED_COLOR) || null,
        timestamp: null,
        fields: [],
        disableAutomaticContext: false
    };

    constructor(data: BetterEmbedData) {
        this.data = { ...this.data, ...data };

        // this.#parseData();
        // this.#configure();
    }
}
