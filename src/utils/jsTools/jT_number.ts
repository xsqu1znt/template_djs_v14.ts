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


/** Format a number into a short, human-readable string.
 * @param num The number to format.
 * @param units Custom unit names to use.
 * @example
 * ```ts
 * formatNumber(1000) -> "1k"
 * formatNumber(1000000) -> "1mil"
 * formatNumber(1000000000) -> "1bil"
 * formatNumber(1000, [" thou", " mill", " bill"]) -> "1 thou"
 * ``` */
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

export default { clamp, secToMs, msToSec, formatThousands, formatLargeNumber };
