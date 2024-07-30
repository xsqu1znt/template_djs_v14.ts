import * as _o from "./jT_object";

/** Filter out items that are not unique within an array.
 * @param arr The array of items to filter.
 * @param prop The nested property within each item to filter by.
 * @param copy Return a deep copy of the array using structuredClone(). */
export function unique(arr: any[], prop: string = "", copy: boolean = false) {
    let arr_new = [];
    let map = new Map();

    for (let item of arr) {
        let _prop = typeof item === "object" ? _o.getProp(item, prop) : item;

        if (!map.has(_prop)) {
            map.set(_prop, true);
            arr_new.push(item);
        }
    }

    return copy ? structuredClone(arr_new) : arr_new;
}

interface ForceArrayOptions {
    copy?: boolean;
    filterFalsey?: boolean;
}

/** Check if the given item is an array, return the item in an array if it isn't. */
export function forceArray<T>(item: T, options?: ForceArrayOptions) {
    let _item: T[] = [];

    if (Array.isArray(item)) return item;

    if (options?.filterFalsey) _item = _item.filter(i => i);
    if (options?.copy) _item = structuredClone(_item);

    return _item as T extends any[] ? T : T[];
}
