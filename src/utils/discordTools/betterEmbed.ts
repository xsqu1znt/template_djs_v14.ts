interface BetterEmbedData {
    context?: { interaction?: BaseInteraction; channel?: TextBasedChannel; message?: Message };

    author?: string | {};
    title?: string | {};
    thumbnailURL?: string;
    description?: string;
    imageURL?: string;
    footer?: string | {};
    fields?: { name: string; value: string; inline?: boolean }[];
    color?: string | string[];
    timestamp?: string | number | boolean | Date;
}

import { BaseInteraction, EmbedBuilder, Message, TextBasedChannel } from "discord.js";
import { dynaSend } from "./dynaSend";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";

import {} from "./config.json";
import * as config from "@configs";

import { IS_DEV_MODE } from "@index";
