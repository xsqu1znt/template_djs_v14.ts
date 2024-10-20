import { SendHandler, InteractionResolveable } from "./types";

interface BetterEmbedData {
    /** Can be provided for Auto-shorthand context formatting (_ACF_). */
    context?: {
        client?: Client | null;
        interaction?: InteractionResolveable | null;
        channel?: TextBasedChannel | null;
        message?: Message | null;
        user?: GuildMember | User | null;
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
    fields?: APIEmbedField[] | [];
    /** Color of the `Embed`. */
    color?: ColorResolvable | ColorResolvable[] | null;
    /** The timestamp to be displayed to the right of the `Embed`'s footer.
     *
     * If set to `true`, will use the current time. */
    timestamp?: number | boolean | Date | null;

    /** If `false`, will disable auto-shorthand context formatting. */
    acf?: boolean;
}

interface BetterEmbedAuthor {
    /** A user that will be used for Auto-shorthand context formatting (_ACF_).
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

import {
    APIEmbed,
    APIEmbedField,
    Client,
    ColorResolvable,
    EmbedBuilder,
    GuildMember,
    HexColorString,
    Message,
    TextBasedChannel,
    User
} from "discord.js";
import dynaSend, { DynaSendOptions } from "./dynaSend";
import logger from "@utils/logger";
import jt from "@utils/jsTools";

import { INVIS_CHAR, EMBED_COLOR, EMBED_COLOR_DEV } from "./config.json";
import { IS_DEV_MODE } from "@constants";

/** A powerful wrapper for `EmbedBuilder` that introduces useful features.
 *
 * Auto-shorthand context formatting (_ACF_) is enabled by default.
 *
 * All functions utilize _ACF_ unless `BetterEmbed.acf` is set to `false`.
 *
 * ___Use a blackslash___ `\` ___to escape any context.___
 *
 * \- - - Author Context - - -
 * - __`$USER`__: _author's mention (@xsqu1znt)_
 * - __`$USER_NAME`__: _author's username_
 * - __`$DISPLAY_NAME`__: _author's display name (requires `GuildMember` context)_
 * - __`$USER_AVATAR`__: _author's avatar_
 *
 * \- - - Client Context - - -
 *
 * - __`$BOT_AVATAR`__: _bot's avatar_
 *
 * \- - - Shorthand Context - - -
 * - __`$INVIS`__: _invisible character_
 *
 * - __`$YEAR`__: _YYYY_
 * - __`$MONTH`__: _MM_
 * - __`$DAY`__: _DD_
 * - __`$year`__: _YY_
 * - __`$month`__: _M or MM_
 * - __`$day`__: _D or DD_
 *
 * ___NOTE:___ `Client` is also included in `RepliedInteraction` and `Message` contexts. */
export default class BetterEmbed {
    #embed = new EmbedBuilder();

    #dataInit: BetterEmbedData = {
        context: { client: null, interaction: null, channel: null, message: null, user: null },
        author: { context: null, text: "", icon: null, hyperlink: null },
        title: { text: "", hyperlink: null },
        thumbnailURL: null,
        imageURL: null,
        description: null,
        footer: { text: "", icon: null },
        color: (jt.choice(IS_DEV_MODE ? EMBED_COLOR_DEV : EMBED_COLOR) as HexColorString) || null,
        timestamp: null,
        fields: [],
        acf: true
    };

    data: BetterEmbedData = {
        context: { client: null, interaction: null, channel: null, message: null, user: null },
        author: { context: null, text: "", icon: null, hyperlink: null },
        title: { text: "", hyperlink: null },
        thumbnailURL: null,
        imageURL: null,
        description: null,
        footer: { text: "", icon: null },
        color: (jt.choice(IS_DEV_MODE ? EMBED_COLOR_DEV : EMBED_COLOR) as HexColorString) || null,
        timestamp: null,
        fields: [],
        acf: true
    };

    #applyContextFormatting(str: string): string {
        if (!str) return "";
        if (!str.includes("$") || !this.data.acf) return str;

        let user: User | null = null;
        let guildMember: GuildMember | null = null;
        let date: Date = new Date();

        /// Shorthand author context
        if (!this.data.context?.user) {
            let _authorContext = (this.data.author as BetterEmbedAuthor).context;

            if (_authorContext instanceof User) user = _authorContext;
            if (_authorContext instanceof GuildMember) {
                user = _authorContext.user;
                guildMember = _authorContext;
            }
        } else {
            if (this.data.context.user instanceof User) user = this.data.context.user;
            if (this.data.context.user instanceof GuildMember) {
                user = this.data.context.user.user;
                guildMember = this.data.context.user;
            }
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
        if (this.data.acf) {
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

    #configure(): void {
        this.setAuthor();
        this.setTitle();
        this.setThumbnail();
        this.setDescription();
        this.setImage();
        this.setFooter();
        this.addFields(this.data.fields, true);
        this.setColor();
        this.setTimestamp();
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
    toJSON(): APIEmbed {
        return this.#embed.toJSON();
    }

    /** Set the embed's author. */
    setAuthor(author: BetterEmbedAuthor | null = this.data.author as BetterEmbedAuthor): this {
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
        if (_thisAuthor.text) {
            this.#embed.setAuthor({ name: _thisAuthor.text });
        }

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
        if (_thisAuthor?.hyperlink) {
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

    /** Set the embed's title. */
    setTitle(title: BetterEmbedTitle | null = this.data.title as BetterEmbedTitle): this {
        let _thisTitle = this.data.title as BetterEmbedTitle;

        // prettier-ignore
        if (title === null)
            this.data.author = structuredClone(this.#dataInit.title);
        else if (typeof title === "string")
            this.data.author = { ..._thisTitle, text: title };
        else
            this.data.author = { ..._thisTitle, ...title };

        // Parse the updated author data
        this.#parseData();

        // Title > .text
        if (_thisTitle.text) {
            this.#embed.setTitle(_thisTitle.text);
        }

        // Title > .hyperlink
        if (_thisTitle?.hyperlink) {
            try {
                this.#embed.setURL(_thisTitle.hyperlink || null);
            } catch (err) {
                logger.error("$_TIMESTAMP [BetterEmbed]", `INVALID_TITLE_HYPERLINK | '${_thisTitle.hyperlink}'`, err);
            }
        }

        return this;
    }

    /** Set the embed's thumbnail. */
    setThumbnail(url: string | null = this.data.thumbnailURL as string | null): this {
        if (url) url = this.#applyContextFormatting(url.trim());

        try {
            this.#embed.setThumbnail(url);
        } catch (err) {
            logger.error("$_TIMESTAMP [BetterEmbed]", `INVALID_THUMBNAIL_URL | '${this.data.thumbnailURL}'`);
            return this;
        }

        this.data.thumbnailURL = url;
        return this;
    }

    /** Set the embed's description. */
    setDescription(description: string | null = this.data.description as string): this {
        if (description) description = this.#applyContextFormatting(description);
        this.#embed.setDescription(description || null);
        this.data.description = description;
        return this;
    }

    /** Set the embed's image. */
    setImage(url: string | null = this.data.imageURL as string): this {
        if (url) url = this.#applyContextFormatting(url.trim());

        try {
            this.#embed.setImage(url);
        } catch {
            logger.error("$_TIMESTAMP [BetterEmbed]", `INVALID_IMAGE_URL | '${this.data.imageURL}'`);
            return this;
        }

        this.data.imageURL = url;
        return this;
    }

    /** Set the embed's footer. */
    setFooter(footer: BetterEmbedFooter | string | null = this.data.footer as BetterEmbedFooter): this {
        let _thisFooter = this.data.footer as BetterEmbedFooter;

        // prettier-ignore
        if (footer === null)
			this.data.footer = structuredClone(this.#dataInit.footer);
		else if (typeof footer === "string")
			this.data.footer = { ..._thisFooter, text: footer };
		else
            this.data.footer = { ..._thisFooter, ...footer };

        // Parse the updated footer data
        this.#parseData();

        // Footer > .text
        if (_thisFooter.text) {
            this.#embed.setFooter({ text: _thisFooter.text });
        }

        // Footer > .icon
        if (_thisFooter.icon) {
            try {
                this.#embed.setFooter({
                    text: this.#embed.data.footer?.text || "", // NOT-USED
                    iconURL: (_thisFooter.icon as string) || undefined
                });
            } catch (err) {
                logger.error("$_TIMESTAMP [BetterEmbed]", `INVALID_FOOTER_ICON | '${_thisFooter.icon}'`, err);
            }
        }

        return this;
    }

    /** Add or replace the embed's fields.
     *
     * ___NOTE:___ You can only have a MAX of 25 fields per `Embed`. */
    addFields(fieldData: APIEmbedField[] | null = this.data.fields as APIEmbedField[], replaceAll: boolean = false): this {
        let _thisFields = this.data.fields as APIEmbedField[];

        // Clear all fields
        if (replaceAll && !fieldData?.length) {
            this.data.fields = [];
            this.#embed.spliceFields(0, this.#embed.data.fields?.length || 0);
            return this;
        }

        /* what are we supposed to do with an empty array here? */
        if (!fieldData) return this;

        /* - - - - - { Validate Fields } - - - - - */
        if (fieldData.length > 25) {
            let _trimLength = fieldData.length - 25;
            // Trim the array
            fieldData = fieldData.slice(0, 25);
            // prettier-ignore
            logger.log(`$_TIMESTAMP [BetterEmbed] You can only have a MAX of 25 fields. ${_trimLength} ${_trimLength === 1 ? "field has" : "fields have"} been trimmed`);
        }

        // Apply ACF
        if (this.data.acf) {
            for (let i = 0; i < fieldData.length; i++) {
                fieldData[i].name = this.#applyContextFormatting(fieldData[i].name);
                fieldData[i].value = this.#applyContextFormatting(fieldData[i].value);
            }
        }

        if (replaceAll) {
            this.data.fields = fieldData;
            this.#embed.setFields(fieldData);
        } else {
            _thisFields.push(...fieldData);
            this.#embed.addFields(fieldData);
        }

        return this;
    }

    /** Delete or replace the embed's fields.
     *
     * - ___NOTE:___ You can only have a MAX of 25 fields per `Embed`. */
    spliceFields(index: number, deleteCount: number, fieldData?: APIEmbedField[]): this {
        let _thisFields = this.data.fields as APIEmbedField[];

        // prettier-ignore
        // Splice the field data
        if (fieldData)
            _thisFields.splice(index, deleteCount, ...fieldData);
        else
            _thisFields.splice(index, deleteCount);

        return this.addFields(fieldData, true);
    }

    /** Set the embed's color. */
    setColor(color: ColorResolvable | ColorResolvable[] = this.data.color as ColorResolvable): this {
        let _color = Array.isArray(color) ? jt.choice(color) : color;

        try {
            this.#embed.setColor(_color || null);
        } catch {
            logger.error("$_TIMESTAMP [BetterEmbed]", `INVALID_COLOR | '${this.data.color}'`);
            return this;
        }

        this.data.color = _color;
        return this;
    }

    /** Set the embed's timestamp. */
    setTimestamp(timestamp: number | boolean | Date | null = this.data.timestamp as number | Date | null): this {
        if (timestamp === true) timestamp = Date.now();

        try {
            this.#embed.setTimestamp(timestamp as Date | number | null);
        } catch {
            logger.error("$_TIMESTAMP [BetterEmbed]", `INVALID_TIMESTAMP | '${this.data.timestamp}'`);
            return this;
        }

        this.data.timestamp = timestamp || null;
        return this;
    }

    /** Send the embed. */
    async send(handler: SendHandler, options?: DynaSendOptions, data?: BetterEmbedData): Promise<Message | null> {
        let _embed: BetterEmbed = this;
        this.#parseData();

        // Apply ACF to message content
        if (options?.messageContent && this.data.acf)
            options.messageContent = this.#applyContextFormatting(options.messageContent);

        // Clone the embed
        if (data) _embed = this.clone(data);

        // Send the message
        return await dynaSend(handler, {
            ...options,
            embeds: [_embed, ...(options?.embeds ? jt.forceArray(options?.embeds) : [])]
        });
    }
}
