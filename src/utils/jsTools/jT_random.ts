/** Choose a psuedo-random number within a min-max range.
 * @param minimum Minimum value.
 * @param maximum Maximum value.
 * @param round Round up the sum. */
export function randomNumber(min: number, max: number, round: boolean = true) {
    min = Number(min);
    max = Number(max);

    let sum = min + (max - min) * Math.random();
    return round ? Math.round(sum) : sum;
}

/** Choose a psuedo-random item from an array.
 * @param arr Array of items to choose from.
 * @param copy Return a deep copy of the array using structuredClone(). */
export function choice<T>(arr: T[], copy: boolean = false): T {
    let item = arr[randomNumber(0, arr.length - 1)];
    return copy ? structuredClone(item) : item;
}
