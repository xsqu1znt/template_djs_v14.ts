import __object from "./jT_object";

/** Get the sum of an array of numbers. Any negative numbers will subtract from the total.
 * @param arr The array to sum.
 * @param path The path to a nested array property.
 * @param ignoreNaN Ignore non-numerical values and use 0 instead. */
export function sum(arr: number[], path: string = "", ignoreNaN: boolean = false): number {
    const _path = path.trim();

    // Map the array if a path is provided
    const _arr = _path ? arr.map(a => Number(__object.getProp(a, _path))) : arr;

    return _arr.reduce((a, b) => {
        const invalid = isNaN(b) && !ignoreNaN;
        if (invalid) throw new TypeError(`\'${b}\' is not a valid number`);
        if (invalid && ignoreNaN) b = 0;
        return b < 0 ? a - -b : a + (b || 0);
    }, 0);
}

/** Clamps a number within a specified range.
 * @param num Number to be clamped.
 * @param range The range to clamp. `min` defaults to 0. */
export function clamp(num: number, max: number): number;
export function clamp(num: number, range: { min?: number; max: number }): number;
export function clamp(num: number, range: { min?: number; max: number } | number): number {
    let _range = { min: 0, max: 0 };
    if (typeof range === "number") _range.max = range;
    else _range = { min: range.min || 0, max: range.max };
    return num < _range.min ? _range.min : num > _range.max ? _range.max : num;
}

/** Get the percentage value between two numbers.
 * @param a The numerator.
 * @param b The denominator.
 * @param round Whether to round the result to the nearest integer.
 *
 * @example
 * percent(50, 100) --> 50 // 50%
 * percent(30, 40) --> 75 // 75% */
export function percent(a: number, b: number, round: boolean = true): number {
    return round ? Math.floor((a / b) * 100) : (a / b) * 100;
}

/** Converts seconds to milliseconds.
 * @param sec The number of seconds to convert.
 * @param round Whether to round the result to the nearest integer. */
export function secToMs(sec: number, round: boolean = true): number {
    return round ? Math.floor(sec * 1000) : sec * 1000;
}

/** Convert milliseconds to seconds.
 * @param ms The number of milliseconds to convert.
 * @param round Whether to round the result to the nearest integer. */
export function msToSec(ms: number, round: boolean = true): number {
    return round ? Math.floor(ms / 1000) : ms / 1000;
}

/** Format a number adding a decimal point to each thousand's place.
 * @param num The number to format.
 * @param sep The decimal point to use.
 *
 * @example
 * formatThousands(1000) --> "1,000"
 * formatThousands(1000, ".") --> "1.000" */
export function formatThousands(num: number, sep: string = ","): string {
    return `${num}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, sep);
}

/** Format a number into a short, human-readable string.
 * @param num The number to format.
 * @param units Custom unit names to use.
 *
 * @example
 * formatNumber(1000) -> "1k"
 * formatNumber(1000000) -> "1mil"
 * formatNumber(1000000000) -> "1bil"
 * formatNumber(1000, [" thou", " mill", " bill"]) -> "1 thou" */
export function formatLargeNumber(num: number, units: [string, string, string] = ["k", "mil", "bil"]): string {
    const _units = ["", ...units];
    let index = 0;
    while (Math.abs(num) >= 1000 && index < _units.length - 1) {
        num /= 1000;
        index++;
    }
    let result = num.toFixed(1).replace(/\.0$/, "");
    if (result.slice(-1) === "0") result = result.slice(0, -1);
    return result + _units[index];
}

/** Add the ordinal place to the end of a given number.
 * @param num The number to add the ordinal to.
 *
 * @example
 * ordinal(1) -> "1st"
 * ordinal(2) -> "2nd"
 * ordinal(3) -> "3rd"
 * ordinal(4) -> "4th" */
export function toOrdinal(num: number): string {
    const endings = ["th", "st", "nd", "rd"];
    const mod = num % 100;
    return `${num}${endings[(mod - 20) % 10] || endings[mod] || endings[0]}`;
}

export default { sum, clamp, percent, secToMs, msToSec, formatThousands, formatLargeNumber, toOrdinal };
