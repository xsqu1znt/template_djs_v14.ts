import { Model } from "mongoose";

interface DocumentFilterOptions<T> {
    /** The query used to filter the document. */
    query?: Partial<T>;
    /** `false` by default. */
    upsert?: boolean;
    /** `true` by default. */
    lean?: boolean;
}

interface DocumentUpdateOptions<T> {
    /** The data to update the document. */
    query: Partial<T>;
    /** `false` by default. */
    upsert?: boolean;
    /** `true` by default. */
    lean?: boolean;
}

async function count<T>(model: Model<T>, filter?: Partial<T>) {
    return await model.countDocuments(filter);
}

async function exists<T>(model: Model<T>, filter: string | Partial<T>): Promise<boolean> {
    switch (typeof filter) {
        case "string":
            return (await model.exists({ _id: filter })) ? true : false;
        case "object":
            return (await model.exists(filter)) ? true : false;
        default:
            return false;
    }
}

async function insertNew<T>(model: Model<T>, _id: string) {
    if (await exists(model, _id)) return;
    let doc = new model({ _id });
    await doc.save();
    return doc;
}

async function fetch<T>(model: Model<T>, _id: string, options?: DocumentFilterOptions<T>) {
    let lean = options?.lean ?? true;
    return await model.findById(_id, options?.query, { upsert: options?.upsert, lean });
}

async function update<T>(model: Model<T>, filter: string | Partial<T>, options: DocumentUpdateOptions<T>) {
    let lean = options.lean ?? true;
    return await model.findByIdAndUpdate(filter, options.query, { upsert: options.upsert, lean });
}

export default { count, exists, insertNew, fetch, update };
