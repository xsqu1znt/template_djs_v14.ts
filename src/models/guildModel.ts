import { Schema, model as Model } from "mongoose";
import config from "../configs";

export const schema = new Schema(
    {
        _id: { type: String, required: true },
        prefix: { type: String, default: config.client.PREFIX },
        timestamp_joined: { type: Date, default: Date.now() }
    },
    { collection: "guilds" }
);

export const model = Model("guilds", schema);
