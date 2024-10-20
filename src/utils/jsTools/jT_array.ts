type ForcedArray<T> = T extends any[] ? T : T[];
interface ForceArrayOptions {
    /** Return a deep copy of the array using {@link structuredClone}. */
    copy?: boolean;
    /** Remove falsey values from the array. */
    filterFalsey?: boolean;
}

type BetterMapCallback<T extends any[]> = (
    item: T[number],
    extra: {
        idx: number;
        lastElement: T[number] | undefined;
        newArray: T[number][];
        originalArray: T;
    }
) => T[number];

type ToMapCallback<T extends any[]> = (
    item: T[number],
    extra: {
        idx: number;
        lastElement: T[number] | undefined;
        newMap: Map<any, any>;
        originalArray: T;
    }
) => { key: any; value: any };

import * as __object from "./jT_object";

/** Split an array into groups that don't exceed the given size.
 * @param {array} arr The array to split.
 * @param {number} size The max size before splitting.
 * @param {boolean} copy Return a deep copy of the array using {@link structuredClone}. */
export function chunk<T extends any[]>(arr: T, size: number, copy: boolean = false): T[] {
    if (size <= 0) throw new Error("Size cannot be 0 or negative");
    if (!arr.length || arr.length < size) return [arr];

    const chunk: T[] = [];

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
 * Property paths utilize {@link __object.getProp getProp} which allows for advanced property paths.
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
 * @param copy Return a deep copy of the array using {@link structuredClone}. */
export function unique<T extends any[]>(arr: T, prop?: string, copy: boolean = false): T {
    const uniqueArray = [];
    const referenceMap = new Map();

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

/** Convert the given item into an array if it is not already.
 * @param item The item to be converted into an array.
 * @param options Optional settings for the conversion. */
export function forceArray<T>(item: T, options?: ForceArrayOptions): ForcedArray<T> {
    let itemArray = Array.isArray(item) ? item : [item];
    if (options?.filterFalsey) itemArray = itemArray.filter(Boolean);
    if (options?.copy) itemArray = structuredClone(itemArray);
    return itemArray as ForcedArray<T>;
}

/** Similar to {@link Array.prototype.map}, but gives the callback access to the new array being constructed.
 * @param arr The array to map over.
 * @param callback The callback to run on each item in the array.
 * @param copy Return a deep copy of the array using {@link structuredClone}. */
function betterMap<T extends any[]>(arr: T, callback: BetterMapCallback<T>, copy = false): T {
    const arrayOriginal: T = arr;
    const arrayNew: any = [];

    for (let idx = 0; idx < arrayOriginal.length; idx++) {
        const lastElement = arrayNew[idx - 1];
        arrayNew.push(callback(arrayOriginal[idx], { idx, lastElement, newArray: arrayNew, originalArray: arrayOriginal }));
    }

    return (copy ? structuredClone(arrayNew) : arrayNew) as T;
}

/** Similar to {@link Array.prototype.map}, but instead returns a {@link Map}.
 *
 * The callback is given access to the new map being constructed.
 * @param arr The array to map.
 * @param callback The callback to run on each item in the array.
 * @param copy Return a deep copy of the map's values using {@link structuredClone}. */
function toMap<T extends any[]>(arr: T, callback: ToMapCallback<T>, copy = false): Map<any, any> {
    let arrayOriginal: T = arr;
    let mapNew: Map<any, any> = new Map();

    for (let idx = 0; idx < arrayOriginal.length; idx++) {
        const lastElement = mapNew.get(idx - 1);
        const item = callback(arrayOriginal[idx], { idx, lastElement, newMap: mapNew, originalArray: arrayOriginal });
        mapNew.set(item.key, copy ? structuredClone(item.value) : item.value);
    }

    return mapNew;
}

export default { chunk, unique, forceArray, betterMap, toMap };
