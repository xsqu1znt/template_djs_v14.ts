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

import { INVIS_CHAR, EMBED_COLOR, EMBED_COLOR_DEV } from "./config.json";
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

    #dataInit: BetterEmbedData = {
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

    #applyContextFormatting(str: string): string {
        if (!str) return "";
        if (!str.includes("$")) return str;

        let user: User | null = null;
        let guildMember: GuildMember | null = null;
        let date: Date = new Date();

        /// Shorthand author context
        let _authorContext = (this.data.author as BetterEmbedAuthor).context;

        if (_authorContext instanceof User) user = _authorContext;
        if (_authorContext instanceof GuildMember) {
            user = _authorContext.user;
            guildMember = _authorContext;
        }

        /* - - - - - { Author Context } - - - - - */
        // prettier-ignore
        // User specific context
        if (user) str = str
			.replace(/(?<!\\)\$USER\b/g, user.toString())
			.replace(/(?<!\\)\$USER_NAME\b/g, user.username)
			.replace(/(?<!\\)\$USER_AVATAR\b/g, user.avatarURL() || "USER_HAS_NO_AVATAR");

        // prettier-ignore
        // GuildMember specific context
        if (guildMember) str = str
			.replace(/(?<!\\)\$DISPLAY_NAME\b/g, guildMember.displayName);

        /* - - - - - { General Context } - - - - - */
        let _interactionOrMessageContext = this.data.context?.interaction || this.data.context?.message;

        // prettier-ignore
        if (_interactionOrMessageContext) str = str
			.replace(/(?<!\\)\$BOT_AVATAR\b/g, _interactionOrMessageContext.client.user.avatarURL() || "BOT_HAS_NO_AVATAR");

        // prettier-ignore
        str = str
			.replace(/(?<!\\)\$INVIS\b/g, INVIS_CHAR)

			// User mentions
			.replace(/(?<!\\|<)@[0-9]+(?!>)/g, s => `<@${s.substring(1)}>`)
			// Role mentions
			.replace(/(?<!\\|<)@&[0-9]+(?!>)/g, s => `<@&${s.substring(2)}>`)
			// Channel mentions
			.replace(/(?<!\\|<)#[0-9]+(?!>)/g, s => `<#${s.substring(1)}>`)

			/// Dates
			.replace(/(?<!\\)\$YEAR/g, date.getFullYear().toString())
			.replace(/(?<!\\)\$MONTH/g, `0${date.getMonth() + 1}`.slice(-2))
			.replace(/(?<!\\)\$DAY/g, `0${date.getDate()}`.slice(-2))
			.replace(/(?<!\\)\$year/g, `${date.getFullYear()}`.substring(2))
			.replace(/(?<!\\)\$month/g, `0${date.getMonth() + 1}`.slice(-2))
			.replace(/(?<!\\)\$day/g, `0${date.getDate()}`.slice(-2))

        // Return the formatted string
        return str;
    }

    #parseData(): void {
        /* - - - - - { Cleanup Shorthand Configurations } - - - - - */
        // prettier-ignore
        if (typeof this.data.author === "string")
			this.data.author = { context: null, text: this.data.author, icon: null, hyperlink: null };
		else if (!this.data.author)
			this.data.author = { context: null, text: "", icon: null, hyperlink: null };

        // prettier-ignore
        if (typeof this.data.title === "string")
			this.data.title = { text: this.data.title, hyperlink: null };
		else if (!this.data.title)
			this.data.title = { text: "", hyperlink: null };

        // prettier-ignore
        if (typeof this.data.footer === "string")
			this.data.footer = { text: this.data.footer, icon: null };
		else if (!this.data.footer)
			this.data.footer = { text: "", icon: null };

        // Timestamp
        if (this.data.timestamp === true) this.data.timestamp = Date.now();

        /* - - - - - { Context } - - - - - */
        let _interactionContext = this.data.context?.interaction;
        // If no author context was provided, use the interaction's author
        if (!this.data.author.context && _interactionContext && _interactionContext.member instanceof GuildMember)
            (this.data.author as BetterEmbedAuthor).context = _interactionContext.member;

        let _messageContext = this.data.context?.message;
        // If no author context was provided, use the message's author
        if (!this.data.author.context && _messageContext)
            this.data.author.context = _messageContext?.member || _messageContext?.author;

        /* - - - - - { Automatic Context Formatting } - - - - - */
        if (!this.data.disableAutomaticContext) {
            this.data.author.text = this.#applyContextFormatting(this.data.author.text);
            this.data.title.text = this.#applyContextFormatting(this.data.title.text);
            this.data.description = this.#applyContextFormatting(this.data.description || "");
            this.data.footer.text = this.#applyContextFormatting(this.data.footer.text);

            // Author icon
            if (this.data.author.icon === true && this.data.author.context) {
                if (this.data.author.context instanceof GuildMember)
                    this.data.author.icon = this.data.author.context.user.avatarURL();

                // prettier-ignore
                if (this.data.author.context instanceof User)
					this.data.author.icon = this.data.author.context.avatarURL();
            }
            // string case
            else if (typeof this.data.author.icon === "string")
                this.data.author.icon = this.#applyContextFormatting(this.data.author.icon) || null;
        } else {
            // Author icon
            if (this.data.author.icon === true) this.data.author.icon = null;
        }
    }

    #configure(options?: BetterEmbedData): void {
        // if (options) return this.clone({ ...this.data, ...options });
        // this.setAuthor();
        // this.setTitle();
        // this.setThumbnail();
        // this.setDescription();
        // this.setImage();
        // this.setFooter();
        // this.addFields(this.data.fields, true);
        // this.setColor();
        // this.setTimestamp();
    }

    constructor(data: BetterEmbedData) {
        this.data = { ...this.data, ...data };
        this.#parseData();
        this.#configure();
    }

    /** Returns a new `BetterEmbed` with the same (or different) configuration. */
    clone(options?: BetterEmbedData): BetterEmbed {
        return new BetterEmbed({ ...this.data, ...(options || {}) });
    }

    /** Serializes this builder to API-compatible JSON data. */
    toJSON() {
        return this.#embed.toJSON();
    }

    /** Set the embed's author. */
    setAuthor(author: BetterEmbedAuthor = this.data.author as BetterEmbedAuthor) {
        let _thisAuthor = this.data.author as BetterEmbedAuthor;

        // prettier-ignore
        if (author === null)
			this.data.author = structuredClone(this.#dataInit.author);
		else if (typeof author === "string")
			this.data.author = { ..._thisAuthor, text: author };
		else
            this.data.author = { ..._thisAuthor, ...author };

        // Parse the updated author data
        // mainly just for the 'icon' property
        this.#parseData();

        // Author > .text
        this.#embed.setAuthor({ name: _thisAuthor.text });

        // Author > .icon
        if (_thisAuthor?.icon) {
            try {
                this.#embed.setAuthor({
                    name: this.#embed.data.author?.name || "", // NOT-USED
                    iconURL: (_thisAuthor?.icon as string) || undefined,
                    url: this.#embed.data.author?.url // NOT-USED
                });
            } catch (err) {
                logger.error("$_TIMESTAMP [BetterEmbed]", `INVALID_AUTHOR_ICON | '${_thisAuthor.icon}'`, err);
            }
        }

        // Author > .hyperlink
        if (_thisAuthor?.icon) {
            try {
                this.#embed.setAuthor({
                    name: this.#embed.data.author?.name || "", // NOT-USED
                    iconURL: this.#embed.data.author?.icon_url, // NOT-USED
                    url: (_thisAuthor.hyperlink as string) || undefined
                });
            } catch (err) {
                logger.error("$_TIMESTAMP [BetterEmbed]", `INVALID_AUTHOR_HYPERLINK | '${_thisAuthor.hyperlink}'`, err);
            }
        }

        return this;
    }
}
