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
 * ```ts
 * // returns "1,000"
 * formatThousands(1000)
 *
 * // returns "1.000"
 * formatThousands(1000, ".")
 * ``` */
export function formatThousands(num: number, sep: string = ","): string {
    return `${num}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, sep);
}
