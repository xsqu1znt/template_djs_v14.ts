import { Schema, model as Model } from "mongoose";
import config from "../configs";

export interface iSchema {
    _id: string;
    prefix: string;
    timestamp_joined: Date;
}

export const schema = new Schema<iSchema>(
    {
        _id: { type: String, required: true },
        prefix: { type: String, default: config.client.PREFIX },
        timestamp_joined: { type: Date, default: Date.now() }
    },
    { collection: "guilds" }
);

export const model = Model<iSchema>("guilds", schema);
