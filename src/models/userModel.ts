import { Schema, model as Model } from "mongoose";

export const schema = new Schema(
    {
        _id: { type: String, required: true },
        timestamp_started: { type: Date, default: Date.now() }
    },
    { collection: "users" }
);

export const model = Model("users", schema);
