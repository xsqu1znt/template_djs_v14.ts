/* TODO: add overflow methods */
/** Clamps a number within a specified range.
 * @param num Number to be clamped.
 * @param range The range to clamp. `min` defaults to 0. */
export function clamp(num: number, range: { min?: number; max: number }): number {
    let _range = { min: 0, ...range };
    return num < _range.min ? _range.min : num > _range.max ? _range.max : num;
}

/** Convert seconds to milliseconds by multiplying it by 1,000. */
export function secToMs(sec: number, round: boolean = true): number {
    return round ? Math.floor(sec * 1000) : sec * 1000;
}

/** Convert milliseconds to seconds by dividing it by 1,000. */
export function msToSec(ms: number, round: boolean = true): number {
    return round ? Math.floor(ms / 1000) : ms / 1000;
}

/** Format a number adding a decimal point to each thousand's place.
 * ```ts
 * formatThousands(1000) --> "1,000"
 * formatThousands(1000, ".") --> "1.000"
 * ``` */
export function formatThousands(num: number, div: string = ","): string {
    return `${num}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, div);
}
