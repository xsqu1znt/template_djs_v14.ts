import { Schema, model as Model } from "mongoose";
import config from "@configs";

export interface IGuild {
    _id: string;
    prefix: string;
    joinedAt: Date;
}

export const schema = new Schema<IGuild>(
    {
        _id: { type: String, required: true },
        prefix: { type: String, default: config.client.PREFIX },
        joinedAt: { type: Date, default: Date.now() }
    },
    { collection: "guilds" }
);

export const model = Model<IGuild>("guilds", schema);
