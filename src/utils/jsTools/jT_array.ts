type ForcedArray<T> = T extends any[] ? T : T[];

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
export function forceArray<T>(item: T, options?: ForceArrayOptions): ForcedArray<T> {
    let _items = Array.isArray(item) ? item : [item];

    if (options?.filterFalsey) _items = _items.filter(Boolean);
    if (options?.copy) _items = structuredClone(_items);

    return _items as ForcedArray<T>;
}
