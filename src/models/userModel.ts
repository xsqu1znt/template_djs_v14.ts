import { Schema, model as Model } from "mongoose";

export interface iSchema {
    _id: string;
    timestamp_started: Date;
}

export const schema = new Schema<iSchema>(
    {
        _id: { type: String, required: true },
        timestamp_started: { type: Date, default: Date.now() }
    },
    { collection: "users" }
);

export const model = Model<iSchema>("users", schema);
