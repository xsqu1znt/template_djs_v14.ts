import { SendHandler, EmbedResolveable } from "./types";
import { DynaSendOptions } from "./dynaSend";

type PaginationEvent = "pageChanged" | "pageBack" | "pageNext" | "pageJumped" | "selectMenuOptionPicked";
type PaginationType = "short" | "shortJump" | "long" | "longJump";

interface PageData {
    content?: string;
    embed: EmbedResolveable;
}

interface NestedPageData {
    content?: string;
    embeds: EmbedResolveable[];
}

interface PageNavigatorData {
    /** The type of pagination. Defaults to `short`. */
    type: PaginationType;
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
     * This option also utilizes `@utils/jsTools.parseTime()`, letting you use "10s" or "1m 30s" instead of a number. */
    timeout?: number | null;
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

import { GuildMember, User } from "discord.js";
import { deleteMessageAfter } from "./deleteMessageAfter";
import { dynaSend } from "./dynaSend";
import { BetterEmbed } from "./BetterEmbed";
import logger from "@utils/logger";
import jt from "@utils/jsTools";

import * as config from "./config.json";

export class PageNavigator {
    #configure_page() {}

    #configure_components() {}

    #configure_pagination() {}

    async #navComponents_add() {}

    async #navComponents_remove() {}

    async #navReactions_add() {}

    async #navReactions_remove() {}

    async #askPageNumber(allowedParticipant: User) {}

    async #collectComponents() {}

    async #collectReactions() {}

    constructor() {}

    on(event: PaginationEvent, listener: () => void) {}

    addSelectMenuOptions(...options: {}[]) {}

    removeSelectMenuOptions(indexes: number | number[]) {}

    async setSelectMenuEnabled(enabled: boolean, remove: boolean = false) {}

    async setPaginationType(type: PaginationType) {}

    async insertComponentAtIndex(index: number, component: []) {}

    async removeComponentAtIndex(index: number) {}

    async send(handler: SendHandler, options: {}) {}

    async refresh() {}
}
