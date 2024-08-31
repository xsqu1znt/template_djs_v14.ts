import { SendHandler, EmbedResolveable } from "./types";
import { DynaSendOptions } from "./dynaSend";

type PaginationEvent = "pageChanged" | "pageBack" | "pageNext" | "pageJumped" | "selectMenuOptionPicked" | "timeout";
type PaginationType = "short" | "shortJump" | "long" | "longJump";

interface PageNavigatorOptions {
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
     * I.E. if there's more than 5 pages, add `Page Jump` action.
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
        clearComponents: boolean;
        clearReactions: boolean;
        deleteMessage: boolean;
    };
}

interface PageData {
    content?: string;
    embed: EmbedResolveable;
}

interface NestedPageData {
    content?: string;
    embeds: EmbedResolveable[];
}

interface SelectMenuOptionData {
    /** Custom option ID. Useful if you have custom handling for this option. */
    id?: string;
    /** The emoji to be displayed to the left of the option. */
    emoji?: string | null;
    /** The main text to be displayed. */
    label: string;
    /** The description to be displayed. */
    description: string;
    /** Whether this is the default option. */
    isDefault?: boolean;
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
    User
} from "discord.js";
// import deleteMessageAfter from "./deleteMessageAfter";
import dynaSend from "./dynaSend";
// import BetterEmbed from "./BetterEmbed";
import logger from "@utils/logger";
import jt from "@utils/jsTools";

import * as config from "./config.json";

function isNestedPageData(pageData: any): pageData is NestedPageData {
    return Object.hasOwn(pageData, "embeds");
}

export class PageNavigator {
    options: {
        type: PaginationType;
        allowedParticipants: Array<GuildMember | User>;
        pages: Array<PageData | NestedPageData>;
        useReactions: boolean;
        dynamic: boolean;
        timeout: number | null;
        postTimeout: {
            disableComponents: boolean;
            clearComponents: boolean;
            clearReactions: boolean;
            deleteMessage: boolean;
        };
    };

    data: {
        message: Message | null;
        messageActionRows: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[];

        page: {
            currentEmbed: EmbedResolveable | null;
            currentData: PageData | NestedPageData | null;
            index: { current: number; nested: number };
        };

        selectMenu: {
            currentlySelected: SelectMenuOptionData | null;
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

    #changePage(pageIndex: number, nestedPageIndex: number = 0) {
        // Clamp page index to the number of pages
        this.data.page.index.current = jt.clamp(pageIndex, this.options.pages.length - 1);

        /* - - - - - { Set the Current Page } - - - - - */
        let pageData = this.options.pages[this.data.page.index.current];

        if (isNestedPageData(pageData)) {
            // Clamp nested page index to the number of nested pages
            this.data.page.index.nested = jt.clamp(nestedPageIndex, pageData.embeds.length - 1);

            this.data.page.currentEmbed = pageData.embeds[this.data.page.index.nested];
            this.data.page.currentData = pageData;
        } else {
            this.data.page.currentEmbed = pageData.embed;
            this.data.page.currentData = pageData;
        }

        /* - - - - - { Determine Navigation Options } - - - - - */
        const { CAN_JUMP_THRESHOLD, CAN_USE_LONG_THRESHOLD } = config.navigator;
        this.data.navigation.required = isNestedPageData(pageData) && pageData.embeds.length >= 2;
        this.data.navigation.canJump = isNestedPageData(pageData) && pageData.embeds.length >= CAN_JUMP_THRESHOLD;
        this.data.navigation.canUseLong = isNestedPageData(pageData) && pageData.embeds.length >= CAN_USE_LONG_THRESHOLD;
    }

    #configure_components() {
        this.data.messageActionRows = [];

        // Add select menu navigation, if needed
        if (this.data.selectMenu.optionIds.length) {
            this.data.messageActionRows.push(this.data.components.actionRows.selectMenu);
        }

        // Add button navigation, if needed
        if (this.data.navigation.required && !this.options.useReactions) {
            this.data.messageActionRows.push(this.data.components.actionRows.navigation);
        }
    }

    #configure_navigation() {
        this.data.navigation.reactions = [];
        if (!this.options.useReactions || !this.data.navigation.required) return;

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

    async #navComponents_addToMessage() {
        if (!this.data.message?.editable) return;
        await this.data.message.edit({ components: this.data.messageActionRows }).catch(() => null);
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

    async #askPageNumber(requestedBy: User): Promise<number | null> {
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
            /* > error handling ( START ) */
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
            /* > error handling ( END ) */

            // Delete the message
            if (this.data.message?.deletable) this.data.message = await this.data.message.delete().catch(() => null);
        }

        if (this.data.message && this.data.message.editable && !this.options.postTimeout.deleteMessage) {
            // Disable components
            if (this.options.postTimeout.disableComponents) {
                this.data.messageActionRows.forEach(ar => ar.components.forEach(c => c.setDisabled(true)));
                this.data.message.edit({ components: this.data.messageActionRows }).catch(() => null);
            }
            // Clear components
            if (this.options.postTimeout.clearComponents) {
                this.#navComponents_removeFromMessage();
            }
            // Clear reactions
            if (this.options.postTimeout.clearReactions) {
                this.#navReactions_removeFromMessage();
            }
        }

        // Call events ( TIMEOUT )
        this.#callEventStack("timeout", this.data.message);
    }

    async #collectComponents() {
        if (this.data.collectors.component) {
            this.data.collectors.component.resetTimer();
            return;
        }

        const filter_userIds = this.options.allowedParticipants.map(m => m.id);

        // Create the component collector
        const collector = this.data.message?.createMessageComponentCollector({
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
                            break;
                        case "btn_to_first":
                            break;
                        case "btn_back":
                            break;
                        case "btn_jump":
                            break;
                        case "btn_next":
                            break;
                        case "btn_to_last":
                            break;
                    }
                } catch (err) {
                    logger.error("$_TIMESTAMP [PageNavigator>#collectComponents]", "", err);
                }
            });

            // Collector ( END )
            collector.on("end", async () => {
                this.data.collectors.component = null;
                this.#handlePostTimeout();
            });
        });
    }

    async #collectReactions() {}

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
                clearComponents: true,
                clearReactions: true,
                deleteMessage: false
            }
        };

        this.data = {
            message: null,
            messageActionRows: [],

            page: {
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

                selectMenu: new StringSelectMenuBuilder(),
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
    }

    on(event: "pageChanged", listener: (page: PageData | NestedPageData, index: number) => any, once: boolean): void;
    on(event: "pageBack", listener: (page: PageData | NestedPageData, index: number) => any, once: boolean): void;
    on(event: "pageNext", listener: (page: PageData | NestedPageData, index: number) => any, once: boolean): void;
    on(event: "pageJumped", listener: (page: PageData | NestedPageData, index: number) => any, once: boolean): void;
    on(event: "selectMenuOptionPicked", listener: (option: SelectMenuOptionData) => any, once: boolean): void;
    on(event: "timeout", listener: (message: Message) => any, once: boolean): void;
    on(event: PaginationEvent, listener: Function, once: boolean = false) {
        this.#events[event].push({ listener, once });
    }

    addSelectMenuOptions(...options: {}[]) {}

    removeSelectMenuOptions(indexes: number | number[]) {}

    async setSelectMenuEnabled(enabled: boolean, remove: boolean = false) {}

    async setPaginationType(type: PaginationType) {}

    async insertButtonAt(index: number, component: []) {}

    async removeButtonAt(index: number) {}

    async send(handler: SendHandler, options: SendOptions) {}

    async refresh() {}
}
