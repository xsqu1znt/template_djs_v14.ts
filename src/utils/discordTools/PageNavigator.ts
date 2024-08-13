import { SendHandler, EmbedResolveable } from "./types";
import { DynaSendOptions } from "./dynaSend";

type PaginationEvent = "pageChanged" | "pageBack" | "pageNext" | "pageJumped" | "selectMenuOptionPicked";
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
    User
} from "discord.js";
import { deleteMessageAfter } from "./deleteMessageAfter";
import { dynaSend } from "./dynaSend";
import { BetterEmbed } from "./BetterEmbed";
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
    };

    data: {
        message: Message | null;
        messageActionRows: ActionRowBuilder<ButtonBuilder>[] | never[];

        page: {
            currentEmbed: EmbedResolveable | null;
            currentData: PageData | NestedPageData | null;
            index: { current: number; nested: number };
        };

        selectMenu: {
            currentlySelected: SelectMenuOptionData | null;
            optionIDs: string[];
        };

        navigation: {
            reactions: { current_id: string; label: string }[] | never[];
            required: boolean;
            canUseLong: boolean;
            canJump: boolean;
        };

        collectors: {
            component: InteractionCollector<ButtonInteraction> | null;
            reaction: ReactionCollector | null;
        };

        components: {
            actionRows: {
                selectMenu: ActionRowBuilder<StringSelectMenuBuilder> | null;
                navigation: ActionRowBuilder<ButtonBuilder> | null;
            };

            selectMenu: StringSelectMenuBuilder | null;
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
        pageChanged: Array<Function>;
        pageBack: Array<Function>;
        pageNext: Array<Function>;
        pageJumped: Array<Function>;
        selectMenuOptionPicked: Array<Function>;
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
        this.data.page.index.current = jt.clamp(pageIndex, { max: this.options.pages.length - 1 });

        let pageData = this.options.pages[this.data.page.index.current];

        /* - - - - - { Set the Current Page } - - - - - */
        if (isNestedPageData(pageData)) {
            // Clamp nested page index to the number of nested pages
            this.data.page.index.nested = nestedPageIndex % (pageData.embeds.length - 1);

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

    #configure_components() {}

    #configure_pagination() {}

    async #navComponents_add() {}

    async #navComponents_remove() {}

    async #navReactions_add() {}

    async #navReactions_remove() {}

    async #askPageNumber(allowedParticipant: User) {}

    async #collectComponents() {}

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
                    : jt.parseTime(config.timeouts.PAGINATION)
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
                optionIDs: []
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
                    selectMenu: null,
                    navigation: null
                },

                selectMenu: null,
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
            selectMenuOptionPicked: []
        };
    }

    on(event: "pageChanged", listener: (page: PageData | NestedPageData, index: number) => any): void;
    on(event: "pageBack", listener: (page: PageData | NestedPageData, index: number) => any): void;
    on(event: "pageNext", listener: (page: PageData | NestedPageData, index: number) => any): void;
    on(event: "pageJumped", listener: (page: PageData | NestedPageData, index: number) => any): void;
    on(event: "selectMenuOptionPicked", listener: (option: SelectMenuOptionData) => any): void;
    on(event: PaginationEvent, listener: Function) {
        this.#events[event].push(listener);
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
