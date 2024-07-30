import { Schema, model } from "mongoose";
import config from "@configs";

const schema = new Schema(
    {
        _id: { type: String, required: true },
        prefix: { type: String, default: config.client.PREFIX },
        timestamp_joined: { type: Date, default: Date.now() }
    },
    { collection: "guilds" }
);

export default { schema, model: model("guilds", schema) };
