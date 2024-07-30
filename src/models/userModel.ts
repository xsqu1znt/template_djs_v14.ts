import { Schema, model } from "mongoose";

const schema = new Schema(
    {
        _id: { type: String, required: true },
        timestamp_started: { type: Date, default: Date.now() }
    },
    { collection: "users" }
);

export default { schema, model: model("users", schema) };
