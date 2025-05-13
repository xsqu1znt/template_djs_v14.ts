import {
    AggregateOptions,
    HydratedDocument,
    Model,
    PipelineStage,
    QueryOptions,
    RootFilterQuery,
    UpdateQuery
} from "mongoose";

import mongo from "@utils/mongo";

export type ProjectionTemplate<T> = {
    [P in keyof T]: number;
};

export type LeanOrHydratedDocument<T, O extends QueryOptions<T>> = O["lean"] extends false ? HydratedDocument<T> : T;

export interface DocumentQueryOptions<T> extends QueryOptions {
    /** ___CAUTION: Upserting a document this way will only save the `_id` property.___
     *
     * ___If you have other required properties, they will be ignored and might throw an error upon saving.___
     *
     * ___Use {@link DocumentUtils.upsert upsert} instead for the above case.___*/
    upsert?: boolean;
    /** The template used to filter the returned document.
     *
     * If there's at least one `1` in the query, the document will by default only return the specified props.
     *
     * ___NOTE:___ `_id` and `__v` is always included unless specified otherwise.
     *
     * - Include prop: `1`
     *
     * - Exclude prop: `0` */
    projection?: Partial<ProjectionTemplate<T>>;
}

export interface DocumentUpsertOptions<T> extends DocumentQueryOptions<T> {
    /** If `true`, the document will be checked if it already exists before continuing the operation. Defaults to `true`.
     *
     * Setting to `false` saves a call to the database if you're already checking existance beforehand. */
    checkExists?: boolean;
}

export default class DocumentUtils<T> {
    constructor(public __model: Model<T>) {}

    get __exports() {
        return {
            /** The model used to interact with the collection. */
            __model: this.__model,

            /** Count the number of documents in the collection.
             * @param filter An optional filter to count only the documents that match it. */
            __count: this.count,

            /** Check if a document exists in the collection based on the provided filter.
             * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties. */
            __exists: this.exists,

            /** Insert a document into the collection if it doesn't already exist.
             * @param _id The unique identifier for the document.
             * @param insertQuery The query to use for the insert operation. */
            __insert: this.insert,

            /** Insert a document into the collection if it doesn't already exist, or update it if it does.
             * @param _id The unique identifier for the document.
             * @param upsertQuery The query to use for the upsert operation.
             * @param upsertOptions Optional parameters for the upsert operation. `lean` is `true` by default. */
            __upsert: this.upsert,

            /** Delete a document from the collection based on the provided `_id` or filter.
             * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties. */
            __delete: this.delete,

            /** Delete all documents from the collection that match the provided filter.
             * @param filter The filter used to find the documents to delete. */
            __deleteAll: this.deleteAll,

            /** Fetch a document from the collection based on the provided `_id` or filter.
             * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties.
             * @param options Optional parameters for filtering and querying the document. `lean` is `true` by default. */
            __fetch: this.fetch,

            /** Fetch all documents from the collection that match the provided filter.
             * @param filter The filter used to find the documents.
             * @param options Optional parameters for filtering and querying the document. `lean` is `true` by default. */
            __fetchAll: this.fetchAll,

            /** Fetch every unique value in the collection for the specified field.
             * @param field The field to perform the distinct operation on.
             * @param filter The filter used to find the documents to fetch. */
            __distinct: this.distinct,

            /** Perform an aggregation on the collection.
             * @param pipeline The aggregation pipeline stages.
             * @param options Optional parameters for the aggregation operation. */
            __aggregate: this.aggregate,

            /** Update a document in the collection based on the provided filter.
             * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties.
             * @param query The update operations to be applied to the document.
             * @param options Optional parameters for the update operation. `lean` is `true` by default. */
            __update: this.update,

            /** Update a document in the collection based on the provided filter.
             * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties.
             * @param updateQuery The update operations to be applied to the document. */
            __updateAll: this.updateAll
        };
    }

    /** Count the number of documents in the collection.
     * @param filter An optional filter to count only the documents that match it. */
    count = async (filter?: RootFilterQuery<T>): Promise<number> => {
        await mongo.connect();
        return await this.__model.countDocuments(filter);
    };

    /** Check if a document exists in the collection based on the provided filter.
     * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties. */
    exists = async (filter: string | RootFilterQuery<T>): Promise<boolean> => {
        await mongo.connect();
        switch (typeof filter) {
            case "string":
                return (await this.__model.exists({ _id: filter })) ? true : false;
            case "object":
                return (await this.__model.exists(filter)) ? true : false;
            default:
                return false;
        }
    };

    /** Insert a document into the collection if it doesn't already exist.
     * @param _id The unique identifier for the document.
     * @param insertQuery The query to use for the insert operation. */
    insert = async (_id: string, insertQuery: Partial<T> = {}) => {
        await mongo.connect();
        if (await this.exists(_id)) return null;
        const doc = new this.__model({ _id, ...insertQuery });
        await doc.save();
        return doc.toObject();
    };

    /** Insert a document into the collection if it doesn't already exist, or update it if it does.
     * @param _id The unique identifier for the document.
     * @param upsertQuery The query to use for the upsert operation.
     * @param upsertOptions Optional parameters for the upsert operation. `lean` is `true` by default. */
    upsert = async (_id: string, upsertQuery: Partial<T> = {}, upsertOptions: DocumentUpsertOptions<T> = {}) => {
        await mongo.connect();
        const _upsertOptions = { ...upsertOptions, lean: upsertOptions?.lean ?? true };
        if ((upsertOptions.checkExists ?? true) && (await this.exists(_id)))
            return await this.update(_id, upsertQuery, _upsertOptions);
        return await new this.__model({ _id, ...upsertQuery }).save();
    };

    /** Delete a document from the collection based on the provided `_id` or filter.
     * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties. */
    delete = async (filter: string | RootFilterQuery<T>) => {
        await mongo.connect();
        if (typeof filter === "string") {
            return await this.__model.findByIdAndDelete(filter);
        } else {
            return await this.__model.deleteOne(filter);
        }
    };

    /** Delete all documents from the collection that match the provided filter.
     * @param filter The filter used to find the documents to delete. */
    deleteAll = async (filter: RootFilterQuery<T>) => {
        await mongo.connect();
        return await this.__model.deleteMany(filter);
    };

    /** Fetch a document from the collection based on the provided `_id` or filter.
     * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties.
     * @param options Optional parameters for filtering and querying the document. `lean` is `true` by default. */
    fetch = async <O extends DocumentQueryOptions<T>>(
        filter: string | RootFilterQuery<T>,
        options?: O
    ): Promise<LeanOrHydratedDocument<T, O> | null> => {
        await mongo.connect();
        const _opts = { ...options, lean: options?.lean ?? true };
        if (typeof filter === "string") {
            return await this.__model.findById(filter, _opts?.projection, _opts);
        } else {
            return await this.__model.findOne(filter, _opts?.projection, _opts);
        }
    };

    /** Fetch all documents from the collection that match the provided filter.
     * @param filter The filter used to find the documents to fetch.
     * @param options Optional parameters for filtering and querying the document. `lean` is `true` by default. */
    fetchAll = async <O extends DocumentQueryOptions<T>>(
        filter: RootFilterQuery<T> = {},
        options?: O
    ): Promise<LeanOrHydratedDocument<T, O>[]> => {
        await mongo.connect();
        const _opts = { ...options, lean: options?.lean ?? true };
        return await this.__model.find(filter, options?.projection, _opts);
    };

    /** Perform an aggregation on the collection.
     * @param pipeline The aggregation pipeline stages.
     * @param options Optional parameters for the aggregation operation. */
    aggregate = async (pipeline: PipelineStage[], options?: AggregateOptions) => {
        await mongo.connect();
        return (await this.__model.aggregate(pipeline, options)) ?? [];
    };

    /** Fetch every unique value in the collection for the specified field.
     * @param field The field to perform the distinct operation on.
     * @param filter The filter used to find the documents to fetch. */
    distinct = async <P extends string>(field: P, filter?: RootFilterQuery<T>) => {
        await mongo.connect();
        return await this.__model.distinct(field, filter);
    };

    /** Update a document in the collection based on the provided filter.
     * @param filter The filter used to find the document. It can be a string representing the document's `_id` or an object representing the document's properties.
     * @param updateQuery The update operations to be applied to the document.
     * @param options Optional parameters for the update operation. `lean` is `true` by default. */
    update = async <O extends DocumentQueryOptions<T>>(
        filter: string | RootFilterQuery<T>,
        updateQuery: UpdateQuery<T>,
        options?: O
    ): Promise<LeanOrHydratedDocument<T, O> | null> => {
        await mongo.connect();
        const _options = { ...options, lean: options?.lean ?? true };
        if (typeof filter === "string") {
            return await this.__model.findByIdAndUpdate(filter, updateQuery, _options);
        } else {
            return await this.__model.findOneAndUpdate(filter, updateQuery, _options);
        }
    };

    /** Update a document in the collection based on the provided filter.
     * @param filter The filter used to find the documents to update.
     * @param updateQuery The update operations to be applied to the document. */
    updateAll = async (filter: RootFilterQuery<T>, updateQuery: UpdateQuery<T>) => {
        await mongo.connect();
        return await this.__model.updateMany(filter, updateQuery);
    };
}
