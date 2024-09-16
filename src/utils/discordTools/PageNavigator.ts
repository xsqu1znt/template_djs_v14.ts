import { SendHandler, EmbedResolveable } from "./types";
import { DynaSendOptions } from "./dynaSend";

type PaginationEvent = "pageChanged" | "pageBack" | "pageNext" | "pageJumped" | "selectMenuOptionPicked" | "timeout";
type PaginationType = "short" | "shortJump" | "long" | "longJump";
type RefreshType = "full" | "embed" | "navigation" | "reactions" | "collectors";

export interface PageNavigatorOptions {
    /** The type of pagination. Defaults to `short`. */
    type?: PaginationType;
    /** The user or users that are allowed to interact with the navigator. */
    allowedParticipants: GuildMember | User | Array<GuildMember | User>;
    /** The pages to be displayed. */
    pages: Array<PageData | NestedPageData>;
    /** Whether or not to use reactions instead of buttons. */
    useReactions?: boolean;
    /** Whether to only add the `Page Jump` action when needed.
     *
     * I.E. if there's more than 5 pages, add the `Page Jump` button/reaction.
     *
     * __NOTE__: The threshold can be confiured in the `./config.json` file. */
    dynamic?: boolean;
    /** How long to wait before timing out. Use `null` to never timeout.
     *
     * Defaults to `timeouts.PAGINATION`. Configure in `./config.json`.
     *
     * This option also utilizes `@utils/jsTools.parseTime()`, letting you use "10s" or "1m 30s" instead of a number. */
    timeout?: number | string | null;
    /** What to do after the page navigator times out.
     *
     * ___1.___ `disableComponents`: Disable the components. (default: `false`)
     *
     * ___2.___ `clearComponents`: Clear the components. (default: `true`)
     *
     * ___3.___ `clearReactions`: Clear the reactions. (default: `true`)
     *
     * ___4.___ `deleteMessage`: Delete the message. (default: `false`) */
    postTimeout?: {
        disableComponents: boolean;
        clearComponentsOrReactions: boolean;
        deleteMessage: boolean;
    };
}

export interface PageData {
    content?: string;
    embed: EmbedResolveable;
}

export interface NestedPageData {
    nestedContent?: string[];
    nestedEmbeds: EmbedResolveable[];
}

export interface SelectMenuOptionData {
    /** The emoji to be displayed to the left of the option. */
    emoji?: string | null;
    /** The main text to be displayed. */
    label: string;
    /** The description to be displayed. */
    description?: string;
    /** Custom option ID. Useful if you have custom handling for this option. */
    value?: string;
    /** Whether this is the default option. */
    default?: boolean;
}

interface SendOptions extends Omit<DynaSendOptions, "content" | "embeds" | "components"> {}

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentEmojiResolvable,
    GuildMember,
    InteractionCollector,
    Message,
    ReactionCollector,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    User
} from "discord.js";
import dynaSend from "./dynaSend";
import logger from "@utils/logger";
import jt from "@utils/jsTools";

import * as config from "./config.json";

// Get the name of each pagination reaction emoji
// this will be used as a filter when getting the current reactions from the message
const paginationReactionNames = Object.values(config.navigator.buttons).map(data => data.emoji.name);

function isNestedPageData(pageData: any): pageData is NestedPageData {
    return Object.hasOwn(pageData, "nestedEmbeds");
}

export default class PageNavigator {
    options: {
        type: PaginationType;
        allowedParticipants: Array<GuildMember | User>;
        pages: Array<PageData | NestedPageData>;
        useReactions: boolean;
        dynamic: boolean;
        timeout: number | null;
        postTimeout: {
            disableComponents: boolean;
            clearComponentsOrReactions: boolean;
            deleteMessage: boolean;
        };
    };

    data: {
        message: Message | null;
        messageActionRows: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[];
        extraUserButtons: { index: number; component: ButtonBuilder }[];

        page: {
            currentMessageContent: string | undefined;
            currentEmbed: EmbedResolveable | null;
            currentData: PageData | NestedPageData | null;
            index: { current: number; nested: number };
        };

        selectMenu: {
            currentlySelected: StringSelectMenuOptionBuilder | null;
            optionIds: string[];
        };

        navigation: {
            reactions: { name: string; id: string }[];
            required: boolean;
            canUseLong: boolean;
            canJump: boolean;
        };

        collectors: {
            component: InteractionCollector<StringSelectMenuInteraction | ButtonInteraction> | null;
            reaction: ReactionCollector | null;
        };

        components: {
            actionRows: {
                selectMenu: ActionRowBuilder<StringSelectMenuBuilder>;
                navigation: ActionRowBuilder<ButtonBuilder>;
            };

            selectMenu: StringSelectMenuBuilder;
            navigation: {
                to_first: ButtonBuilder;
                back: ButtonBuilder;
                jump: ButtonBuilder;
                next: ButtonBuilder;
                to_last: ButtonBuilder;
            };
        };
    };

    #events: {
        pageChanged: Array<{ listener: Function; once: boolean }>;
        pageBack: Array<{ listener: Function; once: boolean }>;
        pageNext: Array<{ listener: Function; once: boolean }>;
        pageJumped: Array<{ listener: Function; once: boolean }>;
        selectMenuOptionPicked: Array<{ listener: Function; once: boolean }>;
        timeout: Array<{ listener: Function; once: boolean }>;
    };

    #createButton(data: { custom_id: string; emoji?: ComponentEmojiResolvable; label: string }) {
        let button = new ButtonBuilder({ custom_id: data.custom_id, style: ButtonStyle.Secondary });
        if (data.label) button.setLabel(data.label);
        else if (data.emoji) button.setEmoji(data.emoji);
        // prettier-ignore
        else throw new Error(
			"[EmbedNavigator>createButton] You must provide text or an emoji ID for this navigator button in '_dT_config.json'."
        )
        return button;
    }

    #setPage(pageIndex: number = this.data.page.index.current, nestedPageIndex: number = this.data.page.index.nested) {
        // Clamp page index to the number of pages
        this.data.page.index.current = jt.clamp(pageIndex, this.options.pages.length - 1);

        // Set the currently selected option, if it exists
        this.data.selectMenu.currentlySelected =
            this.data.components.selectMenu.options[this.data.page.index.current] || null;

        if (this.data.selectMenu.currentlySelected) {
            // Reset the 'default' property for each select menu option
            this.data.components.selectMenu.options.forEach(o => o.setDefault(false));
            // Set the 'default' property for the currently selected option
            this.data.selectMenu.currentlySelected.setDefault(true);
        }

        /* - - - - - { Set the Current Page } - - - - - */
        let pageData = this.options.pages[this.data.page.index.current];

        if (isNestedPageData(pageData)) {
            /// Clamp nested page index to the number of nested pages & allow overflow wrapping
            this.data.page.index.nested = nestedPageIndex % pageData.nestedEmbeds.length;
            if (this.data.page.index.nested < 0) this.data.page.index.nested = pageData.nestedEmbeds.length - 1;

            this.data.page.currentEmbed = pageData.nestedEmbeds[this.data.page.index.nested];
            this.data.page.currentData = pageData;
            this.data.page.currentMessageContent = pageData.nestedContent
                ? pageData.nestedContent[this.data.page.index.nested] || undefined
                : undefined;
        } else {
            // Reset nested page index
            this.data.page.index.nested = 0;

            this.data.page.currentEmbed = pageData.embed;
            this.data.page.currentData = pageData;
            this.data.page.currentMessageContent = pageData.content || undefined;
        }

        /* - - - - - { Determine Navigation Options } - - - - - */
        const { CAN_JUMP_THRESHOLD, CAN_USE_LONG_THRESHOLD } = config.navigator;
        this.data.navigation.required = isNestedPageData(pageData) && pageData.nestedEmbeds.length >= 2;
        this.data.navigation.canJump = isNestedPageData(pageData) && pageData.nestedEmbeds.length >= CAN_JUMP_THRESHOLD;
        this.data.navigation.canUseLong =
            isNestedPageData(pageData) && pageData.nestedEmbeds.length >= CAN_USE_LONG_THRESHOLD;
    }

    #configure_navigation() {
        this.data.navigation.reactions = [];
        if (!this.data.navigation.required) return;

        let navTypes = [];

        // prettier-ignore
        switch (this.options.type) {
            case "short":
                navTypes = ["back", "next"];                                                    // Short ( STATIC )
                break;

            case "shortJump":
                navTypes = this.options.dynamic
                    ? this.data.navigation.canJump
                        ? ["back", "jump", "next"]                                              // Short Jump ( DYNAMIC )
                        : ["back", "next"]                                                      // Short ( DYNAMIC )
                    : ["back", "jump", "next"];                                                 // Short Jump ( STATIC )
                break;

            case "long":
                navTypes = ["to_first", "back", "next", "to_last"];                             // Long ( STATIC )
                break;

            case "longJump":
                navTypes = this.options.dynamic
                    ? this.data.navigation.canJump
                        ? ["to_first", "back", "jump", "next", "to_last"]                       // Long Jump ( DYNAMIC )
                        : ["to_first", "back", "next", "to_last"]                               // Long ( DYNAMIC )
                    : ["to_first", "back", "jump", "next", "to_last"];                          // Long Jump ( STATIC )
                break;
        }

        // Convert types to reactions/buttons
        if (this.options.useReactions) {
            /* as reactions */
            this.data.navigation.reactions = navTypes.map(type =>
                jt.getProp<{ name: string; id: string }>(config.navigator.buttons, `${type}.emoji`)
            );
        } else {
            /* as buttons */
            this.data.components.actionRows.navigation.setComponents(
                ...navTypes.map(type => jt.getProp<ButtonBuilder>(this.data.components.navigation, type))
            );
        }

        // Add extra buttons, if any
        for (const btn of this.data.extraUserButtons) {
            this.data.components.actionRows.navigation.components.splice(btn.index, 0, btn.component);
        }
    }

    #configure_components() {
        this.data.messageActionRows = [];

        // Add select menu navigation, if needed
        if (this.data.selectMenu.optionIds.length) {
            this.data.components.actionRows.selectMenu.setComponents(this.data.components.selectMenu);
            this.data.messageActionRows.push(this.data.components.actionRows.selectMenu);
        }

        // Add button navigation, if needed
        if (this.data.navigation.required && !this.options.useReactions) {
            this.data.messageActionRows.push(this.data.components.actionRows.navigation);
        }
    }

    #configure() {
        this.#setPage();
        this.#configure_navigation();
        this.#configure_components();
    }

    #callEventStack(event: PaginationEvent, ...args: any) {
        if (!this.#events[event].length) return;

        // Iterate through the event listeners
        for (let i = 0; i < this.#events[event].length; i++) {
            // Execute the listener function
            this.#events[event][i].listener.apply(null, args);
            // Remove once listeners
            if (this.#events[event][i].once) this.#events[event].splice(i, 1);
        }
    }

    async #navComponents_addToMessage(): Promise<Message | null> {
        if (!this.data.message?.editable) return null;
        return await this.data.message.edit({ components: this.data.messageActionRows }).catch(() => null);
    }

    async #navComponents_removeFromMessage() {
        if (!this.data.message?.editable) return;
        await this.data.message.edit({ components: [] }).catch(() => null);
    }

    async #navReactions_addToMessage() {
        if (!this.data.message || !this.options.useReactions || !this.data.navigation.reactions.length) return;

        const reactionNames = Object.values(config.navigator.buttons).map(d => d.emoji.name);

        // Get the current relevant reactions on the message
        let _reactions = this.data.message.reactions.cache.filter(r => reactionNames.includes(r.emoji.name || ""));

        // Check if the cached reactions are the same as the ones required
        if (_reactions.size !== this.data.navigation.reactions.length) {
            await this.#navReactions_removeFromMessage();

            // React to the message
            for (let r of this.data.navigation.reactions) await this.data.message.react(r.id).catch(() => null);
        }
    }

    async #navReactions_removeFromMessage() {
        if (!this.data.message) return;
        await this.data.message.reactions.removeAll().catch(() => null);
    }

    async #askPageNumber(requestedBy: GuildMember | User): Promise<number | null> {
        if (!this.data.message) throw new Error("[EmbedNavigator>#askPageNumber]: 'this.data.message' is undefined.");

        // prettier-ignore
        const _acf = (str: string, msg?: Message) => str
            .replace("$USER_MENTION", requestedBy.toString())
            .replace("$MESSAGE_CONTENT", msg?.content || "");

        let messageReply = await this.data.message
            .reply({ content: _acf(config.navigator.ASK_PAGE_NUMBER_MESSAGE) })
            .catch(() => null);

        /* erorr */
        if (!messageReply) return null;

        /* - - - - - { Collect the next Messsage } - - - - - */
        const _timeouts = {
            confirm: jt.parseTime(config.timeouts.CONFIRMATION),
            error: jt.parseTime(config.timeouts.ERROR_MESSAGE)
        };

        let filter = (msg: Message) => (msg.author.id === requestedBy.id && msg.content.match(/^\d+$/) ? true : false);

        return await messageReply.channel
            .awaitMessages({ filter, max: 1, time: _timeouts.confirm })
            .then(collected => {
                let msg = collected.first();
                if (!msg) return null;

                /* NOTE: subtraction is to account for 0-based index */
                let chosenPageNumber = Number(msg.content) - 1;
                let fuckedUp = false;

                // Check if the chosen page number is within range
                if (chosenPageNumber > 0 && chosenPageNumber <= this.options.pages.length) {
                    fuckedUp = true;
                    dynaSend(msg, {
                        content: _acf(config.navigator.ASK_PAGE_NUMBER_ERROR, msg),
                        deleteAfter: _timeouts.error,
                        fetchReply: false
                    });
                }

                // Delete the user's reply
                if (msg.deletable) msg.delete().catch(() => null);
                // Delete the message reply
                if (messageReply.deletable) messageReply.delete().catch(() => null);

                return fuckedUp ? null : chosenPageNumber;
            })
            .catch(() => {
                // Delete the message reply
                if (messageReply.deletable) messageReply.delete().catch(() => null);
                return null;
            });
    }

    async #handlePostTimeout() {
        if (this.options.postTimeout.deleteMessage) {
            /* > error prevention ( START ) */
            // Get options that are not "deleteMessage"
            let _postTimeoutOptions = Object.entries(this.options.postTimeout)
                // Filter out "deleteMessage"
                .filter(([k, _]) => k !== "deleteMessage")
                // Filter out disabled ones
                .filter(([_, v]) => v)
                // Map only the keys
                .map(([k, _]) => k);

            // Check if any of them are enabled
            if (_postTimeoutOptions.length) {
                logger.debug(
                    `[PageNavigator>#handlePostTimeout]: ${_postTimeoutOptions
                        .map(k => `'${k}'`)
                        .join(", ")} has no effect when 'deleteMessage' is enabled.`
                );
            }
            /* > error prevention ( END ) */

            // Delete the message
            if (this.data.message?.deletable) this.data.message = await this.data.message.delete().catch(() => null);
        }

        if (this.data.message && this.data.message.editable && !this.options.postTimeout.deleteMessage) {
            // Disable components
            if (this.options.postTimeout.disableComponents) {
                this.data.messageActionRows.forEach(ar => ar.components.forEach(c => c.setDisabled(true)));
                this.data.message.edit({ components: this.data.messageActionRows }).catch(() => null);
            }

            if (this.options.postTimeout.clearComponentsOrReactions) {
                if (!this.options.useReactions) {
                    // Clear message components
                    this.#navComponents_removeFromMessage();
                } else {
                    // Clear message reactions
                    this.#navReactions_removeFromMessage();
                }
            }
        }

        // Call events ( TIMEOUT )
        this.#callEventStack("timeout", this.data.message);
    }

    async #collectComponents() {
        if (!this.data.message) return;
        if (!this.data.messageActionRows.length) return;
        if (this.data.collectors.component) {
            this.data.collectors.component.resetTimer();
            return;
        }

        const filter_userIds = this.options.allowedParticipants.map(m => m.id);

        // Create the component collector
        const collector = this.data.message.createMessageComponentCollector({
            filter: i => filter_userIds.includes(i.user.id),
            ...(this.options.timeout ? { time: this.options.timeout } : {})
        }) as InteractionCollector<ButtonInteraction | StringSelectMenuInteraction>;

        // Cache the collector
        this.data.collectors.component = collector;

        return new Promise(resolve => {
            // Collector ( COLLECT )
            collector.on("collect", async i => {
                // Ignore interactions that aren't StringSelectMenu/Button
                if (!i.isStringSelectMenu() && !i.isButton()) return;

                // Defer the interaction
                await i.deferUpdate().catch(() => null);
                // Reset the collector's timer
                collector.resetTimer();

                try {
                    switch (i.customId) {
                        case "ssm_pageSelect":
                            let _ssmOptionIndex = this.data.selectMenu.optionIds.indexOf(
                                (i as StringSelectMenuInteraction).values[0]
                            );
                            this.#setPage(_ssmOptionIndex);
                            this.#callEventStack(
                                "selectMenuOptionPicked",
                                this.data.page.currentData,
                                this.data.components.selectMenu.options[_ssmOptionIndex],
                                this.data.page.index.current
                            );
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.current);
                            return await this.refresh();

                        case "btn_to_first":
                            this.#setPage(this.data.page.index.current, 0);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.nested);
                            return await this.refresh();

                        case "btn_back":
                            this.#setPage(this.data.page.index.current, this.data.page.index.nested - 1);
                            this.#callEventStack("pageBack", this.data.page.currentData, this.data.page.index.nested);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.nested);
                            return await this.refresh();

                        case "btn_jump":
                            let jumpIndex = await this.#askPageNumber(i.user);
                            if (jumpIndex === null) return;
                            this.#setPage(this.data.page.index.current, jumpIndex);
                            this.#callEventStack("pageJumped", this.data.page.currentData, this.data.page.index.nested);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.nested);
                            return await this.refresh();

                        case "btn_next":
                            this.#setPage(this.data.page.index.current, this.data.page.index.nested + 1);
                            this.#callEventStack("pageNext", this.data.page.currentData, this.data.page.index.nested);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.nested);
                            return await this.refresh();

                        case "btn_to_last":
                            this.#setPage(this.data.page.index.current, this.options.pages.length - 1);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.nested);
                            return await this.refresh();
                    }
                } catch (err) {
                    logger.error("$_TIMESTAMP [PageNavigator>#collectComponents]", "", err);
                }
            });

            // Collector ( END )
            collector.on("end", async () => {
                this.data.collectors.component = null;
                this.#handlePostTimeout();
                resolve(this);
            });
        });
    }

    async #collectReactions() {
        if (!this.data.message) return;
        if (!this.data.navigation.reactions.length) return;
        if (this.data.collectors.reaction) {
            this.data.collectors.reaction.resetTimer();
            return;
        }

        const filter_userIds = this.options.allowedParticipants.map(m => m.id);

        // Create the component collector
        const collector = this.data.message.createReactionCollector({
            ...(this.options.timeout ? { time: this.options.timeout } : {})
        });

        // Cache the collector
        this.data.collectors.reaction = collector;

        return new Promise(resolve => {
            // Collector ( COLLECT )
            collector.on("collect", async (reaction, user) => {
                // Ignore reactions that aren't part of our pagination
                if (!paginationReactionNames.includes(reaction.emoji.name || "")) return;

                // Remove the reaction unless it's from the bot itself
                if (user.id !== reaction.message.guild?.members?.me?.id) await reaction.users.remove(user.id);

                // Ignore reactions that weren't from the allowed users
                if (!filter_userIds.includes(user.id)) return;

                // Reset the collector's timer
                collector.resetTimer();

                try {
                    switch (reaction.emoji.name) {
                        case config.navigator.buttons.to_first.emoji.name:
                            this.#setPage(this.data.page.index.current, 0);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.current);
                            return await this.refresh();

                        case config.navigator.buttons.back.emoji.name:
                            this.#setPage(this.data.page.index.current, this.data.page.index.nested - 1);
                            this.#callEventStack("pageBack", this.data.page.currentData, this.data.page.index.nested);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.current);
                            return await this.refresh();

                        case config.navigator.buttons.jump.emoji.name:
                            let jumpIndex = await this.#askPageNumber(user);
                            if (jumpIndex === null) return;
                            this.#setPage(this.data.page.index.current, jumpIndex);
                            this.#callEventStack("pageJumped", this.data.page.currentData, this.data.page.index.nested);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.current);
                            return await this.refresh();

                        case config.navigator.buttons.next.emoji.name:
                            this.#setPage(this.data.page.index.current, this.data.page.index.nested + 1);
                            this.#callEventStack("pageNext", this.data.page.currentData, this.data.page.index.nested);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.current);
                            return await this.refresh();

                        case config.navigator.buttons.to_last.emoji.name:
                            this.#setPage(this.data.page.index.current, this.options.pages.length - 1);
                            this.#callEventStack("pageChanged", this.data.page.currentData, this.data.page.index.current);
                            return await this.refresh();
                    }
                } catch (err) {
                    logger.error("$_TIMESTAMP [PageNavigator>#collectReactions]", "", err);
                }
            });

            // Collector ( END )
            collector.on("end", async () => {
                this.data.collectors.reaction = null;
                this.#handlePostTimeout();
                resolve(this);
            });
        });
    }

    constructor(options: PageNavigatorOptions) {
        /* - - - - - { Error Checking } - - - - - */
        if (!options.pages || !options.pages.length) {
            throw new Error("[EmbedNavigator]: You must provide at least 1 page.");
        }

        // prettier-ignore
        if (options?.useReactions) {
            for (let [key, val] of Object.entries(config.navigator.buttons)) {
				if (!val.emoji.id) throw new Error(`[EmbedNavigator]: \`${key}.id\` is an empty value; This is required to be able to add it as a reaction. Fix this in \'./config.json\'.`);
				if (!val.emoji.name) throw new Error(`[EmbedNavigator]: \`${key}.name\` is an empty value; This is required to determine which reaction a user reacted to. Fix this in \'./config.json\'.`);
            }
        }

        /* - - - - - { Parse Options } - - - - - */
        this.options = {
            ...options,
            type: options.type || "short",
            allowedParticipants: jt.forceArray(options.allowedParticipants),
            useReactions: options.useReactions || false,
            dynamic: options.dynamic || false,
            timeout:
                typeof options.timeout === "string" || typeof options.timeout === "number"
                    ? jt.parseTime(options.timeout)
                    : jt.parseTime(config.timeouts.PAGINATION),
            postTimeout: {
                disableComponents: false,
                clearComponentsOrReactions: true,
                deleteMessage: false
            }
        };

        this.data = {
            message: null,
            messageActionRows: [],
            extraUserButtons: [],

            page: {
                currentMessageContent: undefined,
                currentEmbed: null,
                currentData: null,
                index: { current: 0, nested: 0 }
            },

            selectMenu: {
                currentlySelected: null,
                optionIds: []
            },

            navigation: {
                reactions: [],
                required: false,
                canUseLong: false,
                canJump: false
            },

            collectors: {
                component: null,
                reaction: null
            },

            components: {
                actionRows: {
                    selectMenu: new ActionRowBuilder<StringSelectMenuBuilder>(),
                    navigation: new ActionRowBuilder<ButtonBuilder>()
                },

                selectMenu: new StringSelectMenuBuilder().setCustomId("ssm_pageSelect"),
                navigation: {
                    to_first: this.#createButton({ custom_id: "btn_to_first", ...config.navigator.buttons.to_first }),
                    back: this.#createButton({ custom_id: "btn_back", ...config.navigator.buttons.back }),
                    jump: this.#createButton({ custom_id: "btn_jump", ...config.navigator.buttons.jump }),
                    next: this.#createButton({ custom_id: "btn_next", ...config.navigator.buttons.next }),
                    to_last: this.#createButton({ custom_id: "btn_to_last", ...config.navigator.buttons.to_last })
                }
            }
        };

        this.#events = {
            pageChanged: [],
            pageBack: [],
            pageNext: [],
            pageJumped: [],
            selectMenuOptionPicked: [],
            timeout: []
        };

        /// Configure
        this.#setPage();
        this.#configure_navigation();
        this.#configure_components();
    }

    on(event: "pageChanged", listener: (page: PageData | NestedPageData, index: number) => any, once: boolean): this;
    on(event: "pageBack", listener: (page: PageData | NestedPageData, index: number) => any, once: boolean): this;
    on(event: "pageNext", listener: (page: PageData | NestedPageData, index: number) => any, once: boolean): this;
    on(event: "pageJumped", listener: (page: PageData | NestedPageData, index: number) => any, once: boolean): this;
    on(
        event: "selectMenuOptionPicked",
        listener: (page: PageData | NestedPageData, option: SelectMenuOptionData, index: number) => any,
        once: boolean
    ): this;
    on(event: "timeout", listener: (message: Message) => any, once: boolean): this;
    on(event: PaginationEvent, listener: Function, once: boolean = false): this {
        this.#events[event].push({ listener, once });
        return this;
    }

    /** Add one or more options to the select menu component. */
    addSelectMenuOptions(...options: SelectMenuOptionData[]): this {
        const ssm_options: StringSelectMenuOptionBuilder[] = [];

        for (let data of options) {
            /* error */
            if (!data.emoji && !data.label)
                throw new Error("[PageNavigator>addSelectMenuOptions]: Option must include either an emoji or a label.");

            // Set option defaults
            data = {
                emoji: data.emoji || "",
                label: data.label || `page ${this.data.selectMenu.optionIds.length + 1}`,
                description: data.description || "",
                value: data.value || `ssm_o_${this.data.selectMenu.optionIds.length + 1}`,
                default: data.default ?? this.data.selectMenu.optionIds.length === 0 ? true : false
            };

            // Create a new StringSelectMenuOption
            const ssm_option = new StringSelectMenuOptionBuilder({
                label: data.label,
                value: data.value as string,
                default: data.default
            });

            /// Set option properties, if available
            if (data.emoji) ssm_option.setEmoji(data.emoji);
            if (data.description) ssm_option.setDescription(data.description);

            // Add the new StringSelectMenuOption to the master array
            ssm_options.push(ssm_option);
            // Add the new option ID (value) to our optionIds array
            this.data.selectMenu.optionIds.push(data.value as string);
        }

        // Add the new options to the select menu
        this.data.components.selectMenu.addOptions(...ssm_options);
        return this;
    }

    /** Remove select menu options at the given index/indices.
     * ```ts
     * // Remove the options at index 0, 2, and 4
     * PageNavigator.removeSelectMenuOptions(0, 2, 4);
     *
     * // Remove the last option
     * PageNavigator.removeSelectMenuOptions(-1);
     * ``` */
    removeSelectMenuOptions(...index: number[]): this {
        index.forEach(i => this.data.components.selectMenu.spliceOptions(i, 1));
        return this;
    }

    /** Set the pagination type. */
    setPaginationType(type: PaginationType): this {
        this.options.type = type;
        return this;
    }

    /** Allows inserting a button at the given index in the same action row as the navigation buttons. */
    insertButtonAt(index: number, component: ButtonBuilder): this {
        /* error */
        if (this.data.components.actionRows.navigation.components.length === 5) {
            logger.debug(
                "[PageNavigator>insertButtonAt]: You cannot have more than 5 buttons in the same action row. Add a new ActionRow."
            );
        }

        this.data.extraUserButtons.push({ index, component });
        return this;
    }

    /** Remove buttons at the given index/indices.
     * ```ts
     * // Remove the button at index 0, 2, and 4
     * PageNavigator.removeButtonAt(0, 2, 4);
     *
     * // Remove the last button
     * PageNavigator.removeButtonAt(-1);
     * ``` */
    removeButtonAt(...index: number[]): this {
        index.forEach(i => this.data.extraUserButtons[this.data.extraUserButtons.findIndex(b => b.index === i)]);
        return this;
    }

    /** Send the PageNavigator. */
    async send(handler: SendHandler, options?: SendOptions) {
        this.#setPage();
        this.#configure_navigation();
        this.#configure_components();

        // Send with dynaSend
        this.data.message = await dynaSend(handler, {
            ...options,
            content: this.data.page.currentMessageContent,
            embeds: this.data.page.currentEmbed as EmbedResolveable,
            components: this.data.messageActionRows
        });

        // Return null if failed
        if (!this.data.message) return null;

        // Add reactions, if applicable
        /* NOTE: this is not awaited so we're able to interact with the reactions before they're fully added */
        this.#navReactions_addToMessage();

        // Start collectors
        this.#collectComponents();
        this.#collectReactions();

        // Return the message
        return this.data.message;
    }

    /** Refresh the current page embed, navigation, and collectors. */
    async refresh(type: RefreshType = "full"): Promise<Message | null> {
        /* error */
        if (!this.data.message) {
            logger.debug("[PageNavigator>refresh]: Could not refresh navigator; message not sent.");
            return null;
        }
        if (!this.data.message.editable) {
            logger.debug("[PageNavigator>refresh]: Could not refresh navigator; message not editable.");
            return null;
        }

        const refreshNavigation = () => {
            this.#configure_navigation();
            this.#configure_components();
        };

        const refreshReactions = async () => {
            await this.#navReactions_removeFromMessage();
            await this.#navReactions_addToMessage();
        };

        const refreshCollectors = () => {
            if (this.data.collectors.component) {
                this.data.collectors.component.resetTimer();
            } else {
                this.#collectComponents();
            }

            if (this.data.collectors.reaction) {
                this.data.collectors.reaction.resetTimer();
            } else {
                this.#collectReactions();
            }
        };

        // Determine the refresh operation
        switch (type) {
            case "full":
                this.#setPage();
                this.#configure_navigation();
                this.#configure_components();
                this.data.message = await this.data.message.edit({
                    content: this.data.page.currentMessageContent,
                    embeds: [this.data.page.currentEmbed as EmbedResolveable],
                    components: this.data.messageActionRows
                });
                await refreshReactions();
                break;

            case "embed":
                this.#setPage();
                this.data.message = await this.data.message.edit({
                    content: this.data.page.currentMessageContent,
                    embeds: [this.data.page.currentEmbed as EmbedResolveable]
                });
                break;

            case "navigation":
                refreshNavigation();
                this.data.message = await this.#navComponents_addToMessage();
                break;

            case "reactions":
                await refreshReactions();
                break;

            case "collectors":
                refreshCollectors();
                break;
        }

        return this.data.message;
    }
}
