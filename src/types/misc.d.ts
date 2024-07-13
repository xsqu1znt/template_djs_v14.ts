import { ActivityType } from "discord.js";

export type ActivityData = {
    /** `"dnd"` `"idle"` `"invisible"` `"online"` */
    STATUS: any;
    /** `"playing"` `"streaming"` `"listening"` `"watching"` `"custom"` `"competing"` */
    TYPE: any;
    NAME: string;
    STREAM_URL?: string;
};

export interface ClientActivity {
    INTERVAL?: string | number;
    RANDOM_ACTIVITY?: boolean;

    ACTIVITY: ActivityData | Array<ActivityData>;
}
