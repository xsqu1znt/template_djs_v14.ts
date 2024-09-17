import * as __object from "./jT_object";

/** Split an array into groups that don't exceed the given size.
 * @param {array} arr The array to split.
 * @param {number} size The max size before splitting.
 * @param {boolean} copy Return a deep copy of the array using {@link structuredClone()}. */
export function chunk<T extends any[]>(arr: T, size: number, copy: boolean = false): T[] {
    if (!Array.isArray(arr)) throw new TypeError("A valid array must be provided");
    if (size <= 0) throw new Error("Size cannot be 0 or negative");
    if (!arr.length || arr.length < size) return [arr];

    let chunk: T[] = [];

    // Iterate through the array
    for (let i = 0; i < arr.length; i += size) {
        // Slice the array from the current index
        chunk.push(arr.slice(i, i + size) as T);
    }

    return copy ? structuredClone(chunk) : chunk;
}

/** Filter out duplicate items or items that contain the same nested property value in the given array.
 *
 * If a property path isn't provided, items will be sorted by direct comparison.
 *
 * Property paths utilize {@link __object.getProp} which allows for advanced property paths.
 *
 * @example
 * ```ts
 * const arr = [
 *     { user: [{ id: 1 }, { id: 2 }] },
 *     { user: [{ id: 3 }, { id: 2 }] }
 * ];
 *
 * // Filters out items that contain the same 'id' value for the 2nd item of the 'user' array
 * console.log(unique(arr, "user[1].id"));
 *
 * // output: [{user: [{id: 1}, {id: 2}]}, {user: [{id: 3}]}]
 * ```
 * @param arr The array of items to filter.
 * @param prop The nested property within each item to filter by.
 * @param copy Return a deep copy of the array using {@link structuredClone()}. */
export function unique<T extends any[]>(arr: T, prop?: string, copy: boolean = false): T {
    let uniqueArray = [];
    let referenceMap = new Map();

    for (let item of arr) {
        let property = typeof item === "object" && prop ? __object.getProp(item, prop) : item;

        // Check if the reference map already has this property
        if (!referenceMap.has(property)) {
            referenceMap.set(property, property);
            uniqueArray.push(item);
        }
    }

    return (copy ? structuredClone(uniqueArray) : uniqueArray) as T;
}

interface ForceArrayOptions {
    copy?: boolean;
    filterFalsey?: boolean;
}

type ForcedArray<T> = T extends any[] ? T : T[];

/** Check if the given item is an array, return the item in an array if it isn't. */
export function forceArray<T>(item: T, options?: ForceArrayOptions): ForcedArray<T> {
    let itemArray = Array.isArray(item) ? item : [item];

    if (options?.filterFalsey) itemArray = itemArray.filter(Boolean);
    if (options?.copy) itemArray = structuredClone(itemArray);

    return itemArray as ForcedArray<T>;
}

export default { chunk, unique, forceArray };
