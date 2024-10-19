import __number from "./jT_number";

interface ParseTimeOptions {
    /** Return "s" (seconds) or "ms" (milliseconds). */
    type?: "ms" | "s";
    /** Add `Date.now()` to the result. */
    fromNow?: boolean;
}

/**
 * Parse a string into either milliseconds or seconds
 * @param {string|number} str string to parse
 * @param {ParseTimeOptions} options
 *
 * @example
 * parse("1m") --> 60000
 * parse("1h 30m") --> 5400000
 *
 * parse("1h", { fromNow: true }) --> Date.now() + 3600000
 * parse("-1m", { type: "s" }) --> -60 */
export function parseTime(str: string | number, options?: ParseTimeOptions) {
    const _options = { ...{ type: "ms", fromNow: false }, ...options };

    // Check if the provided string is already a number
    if (typeof str === "number") return str;

    // Match time formats found in the given string query
    const timeQuery = str.matchAll(/([\d]+)([a-zA-Z]+)/g);
    const isNegative = str.startsWith("-");
    let sum = 0;

    // Iterate through each match and preform the conversion operation on them
    for (let query of timeQuery) {
        let time = Number(query[1]);
        const op = query[2] || null;

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
    if (_options.fromNow) isNegative ? (sum = Date.now() - sum) : (sum = Date.now() + sum);
    if (_options.type === "s") sum = __number.msToSec(sum);
    if (!_options.fromNow && isNegative) sum = -sum;

    return sum;
}

interface ETAOptions {
    /** The anchor to go off of, a unix timestamp in milliseconds. `Date.now()` is default */
    since?: number | string;
    /** Leaves out "ago" if the result is in the past. */
    ignorePast?: boolean;
    /** Returns `null` if `unix` is before `since`. */
    nullIfPast?: boolean;
    /** The number of decimal places to round the result to. `0` is default. */
    decimalLimit?: number;
}


/**
 * Parses the time difference between a given Unix timestamp and a reference point into a human-readable string.
 * 
 * @param unix - The Unix timestamp in milliseconds for which the time difference is calculated.
 * @param options - An optional object to configure the behavior of the function.
 * 
 * @example
 * eta(1703001733955) --> "1 hour" (from now)
 * eta(1702994533936, { nullIfPast: true }) --> null */
function eta(unix: number | string, options?: ETAOptions): string | null {
    const _options = {
        ignorePast: false,
        nullIfPast: false,
        decimalLimit: 0,
        ...options,
        since: options?.since ? Number(options.since) : Date.now()
    };
    const _unix = Number(unix);

    /* Check if unix is in the past */
    const isPast = _unix - _options.since < 0;
    if (_options.ignorePast && isPast) return null;

    let difference: number | string = Math.abs(_unix - _options.since);
    /* Return if there's no difference */
    if (!difference && _options.nullIfPast) return null;
    if (!difference) return "now";

    /* - - - - - { Preform Calculations } - - - - - */
    const divisions = [
        { name: "milliseconds", amount: 1000 },
        { name: "seconds", amount: 60 },
        { name: "minutes", amount: 60 },
        { name: "hours", amount: 24 },
        { name: "days", amount: 7 },
        { name: "weeks", amount: 4 },
        { name: "months", amount: 12 },
        { name: "years", amount: Number.POSITIVE_INFINITY }
    ];

    // Divide the difference until we reach a result
    let result = divisions.find((div, idx) => {
        if ((difference as number) < div.amount) return div;
        difference = Math.abs((difference as number) / div.amount).toFixed(
            ["milliseconds", "seconds", "minutes", "hours", "days"].includes(div.name) ? 0 : _options.decimalLimit
        );
    });

    if (!result) return null;

    // Grammar adjustment
    if (difference === 1) result.name = result.name.slice(0, -1);

    return `${difference} ${result.name}${isPast && !_options.ignorePast ? " ago" : ""}`;
}

export default { parseTime, eta };
