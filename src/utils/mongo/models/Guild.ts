import { Schema, model as Model } from "mongoose";
import config from "@configs";

export interface IGuild {
    _id: string;

    prefix: string;
    joinedAt: number;
}

export const GuildSchema = new Schema<IGuild>(
    {
        _id: { type: String, required: true },

        prefix: { type: String, default: config.client.PREFIX },
        joinedAt: { type: Number, default: Date.now() }
    },
    { collection: "Guilds" }
);

export const GuildModel = Model<IGuild>("Guilds", GuildSchema);
