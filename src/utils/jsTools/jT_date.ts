import __number from "./jT_number";

interface parseTime_options {
    /** Return "s" (seconds) or "ms" (milliseconds). */
    type?: "ms" | "s";
    /** Add `Date.now()` to the result. */
    fromNow?: boolean;
}

/** Parse a string into either milliseconds or seconds.
 * ```ts
 * parse("1m") --> 60000
 * parse("1h 30m") --> 5400000
 *
 * parse("1h", { fromNow: true }) --> Date.now() + 3600000
 * parse("-1m", { type: "s" }) --> -60
 * ``` */
export function parseTime(str: string | number, options?: parseTime_options) {
    options = { ...{ type: "ms", fromNow: false }, ...options };

    // Check if the provided string is already a number
    if (typeof str === "number") return str;

    // Match time formats found in the given string query
    let timeQuery = str.matchAll(/([\d]+)([a-zA-Z]+)/g);
    let isNegative = str.startsWith("-");
    let sum = 0;

    // Iterate through each match and preform the conversion operation on them
    for (let query of timeQuery) {
        let time = Number(query[1]);
        let op = query[2] || null;

        // Error checking
        if (isNaN(time) || !op)
            throw new TypeError(`\'${str}\' must be in a parsable time format. Example: '24h' or '1h 30m'`);

        let _parsed = 0;

        // prettier-ignore
        switch (op) {
			case "y": _parsed = time * 12 * 4 * 7 * 24 * 60 * 60 * 1000; break;
			case "mth": _parsed = time * 4 * 7 * 24 * 60 * 60 * 1000; break;
			case "w": _parsed = time * 7 * 24 * 60 * 60 * 1000; break;
			case "d": _parsed = time * 24 * 60 * 60 * 1000; break;
			case "h": _parsed = time * 60 * 60 * 1000; break;
			case "m": _parsed = time * 60 * 1000; break;
			case "s": _parsed = time * 1000; break;
			case "ms": _parsed = time; break;
		}

        // Add to the sum
        sum += _parsed;
    }

    /* - - - - - { Return the Result } - - - - - */
    if (options.fromNow) isNegative ? (sum = Date.now() - sum) : (sum = Date.now() + sum);
    if (options.type === "s") sum = __number.msToSec(sum);
    if (!options.fromNow && isNegative) sum = -sum;

    return sum;
}

export default { parseTime };
