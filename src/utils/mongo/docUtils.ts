import { Model } from "mongoose";

type ProjectionTemplate<T> = {
    [P in keyof T]: number;
};

interface BaseDocumentOptions {
    /** `false` by default. */
    upsert?: boolean;
    /** `true` by default. */
    lean?: boolean;
}

interface DocumentFilterOptions<T> extends BaseDocumentOptions {
    /** The query used to filter the document.
     *
     * - Include prop: `1`
     *
     * - Exclude prop: `0` */
    query?: ProjectionTemplate<Partial<T>>;
}

export default class DocumentUtils<T> {
    constructor(public model: Model<T>) {}

    get exports() {
        return {
            /** Count the number of documents in the collection.
             * @param filter An optional filter to count only the documents that match. */
            _count: this.count,

            /** Check if a document exists in the collection based on the provided filter.
             * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties. */
            _exists: this.exists,

            /** Fetch a document from the collection based on the provided `_id`.
             * @param _id The unique identifier for the document.
             * @param options Optional parameters for filtering and querying the document. */
            _fetch: this.fetch,

            /** Insert a new document into the collection with the given `_id` if it doesn't already exist.
             * @param _id The unique identifier for the document. */
            _insertNew: this.insertNew,

            /** Update a document in the collection based on the provided filter.
             * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties.
             * @param query The update operations to be applied to the document.
             * @param options Optional parameters for the update operation. */
            _update: this.update
        };
    }

    /** Count the number of documents in the collection.
     * @param filter An optional filter to count only the documents that match. */
    async count(filter?: Partial<T>): Promise<number> {
        return await this.model.countDocuments(filter);
    }

    /** Check if a document exists in the collection based on the provided filter.
     * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties. */
    async exists(filter: string | Partial<T>): Promise<boolean> {
        switch (typeof filter) {
            case "string":
                return (await this.model.exists({ _id: filter })) ? true : false;
            case "object":
                return (await this.model.exists(filter)) ? true : false;
            default:
                return false;
        }
    }

    /** Insert a new document into the collection with the given `_id` if it doesn't already exist.
     * @param _id The unique identifier for the document. */
    async insertNew(_id: string) {
        if (await this.exists(_id)) return;
        let doc = new this.model({ _id });
        await doc.save();
        return doc;
    }

    /** Fetch a document from the collection based on the provided `_id`.
     * @param _id The unique identifier for the document.
     * @param options Optional parameters for filtering and querying the document. */
    async fetch(_id: string, options?: DocumentFilterOptions<T>) {
        let lean = options?.lean ?? true;
        return await this.model.findById(_id, options?.query, { upsert: options?.upsert, lean });
    }

    /** Update a document in the collection based on the provided filter.
     * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties.
     * @param query The update operations to be applied to the document.
     * @param options Optional parameters for the update operation. */
    async update(filter: string | Partial<T>, query: Partial<T>, options?: BaseDocumentOptions) {
        let lean = options?.lean ?? true;
        return await this.model.findByIdAndUpdate(filter, query, { upsert: options?.upsert, lean });
    }
}
