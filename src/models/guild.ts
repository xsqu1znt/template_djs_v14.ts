import { Schema, model } from "mongoose";

const schema = new Schema({
    _id: { type: String, required: true }
});

export default { schema, model: model("guilds", schema) };
