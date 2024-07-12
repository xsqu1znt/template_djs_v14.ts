/** Convert seconds to milliseconds by multiplying it by 1,000. */
export function secToMs(sec: number, round: boolean = true) {
    return round ? Math.floor(sec * 1000) : sec * 1000;
}

/** Convert milliseconds to seconds by dividing it by 1,000. */
export function msToSec(ms: number, round: boolean = true) {
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
