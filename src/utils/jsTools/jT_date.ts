interface ParseTimeOptions {
    /** Return "s" (seconds) or "ms" (milliseconds). */
    type?: "ms" | "s";
    /** Add `Date.now()` to the result. */
    fromNow?: boolean;
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

import __number from "./jT_number";

/** Parse a string into either milliseconds or seconds.
 * @param str The string to parse.
 * @param options An optional object to configure the behavior of the function.
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

/** Parses the time difference between a given Unix timestamp and a reference point into a human-readable string.
 * @param unix The Unix timestamp in milliseconds for which the time difference is calculated.
 * @param options An optional object to configure the behavior of the function.
 *
 * @example
 * eta(1703001733955) --> "1 hour" (from now)
 * eta(1702994533936, { nullIfPast: true }) --> null */
export function eta(unix: number | string, options?: ETAOptions): string | null {
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

/** Parses the time difference between a given Unix timestamp and a reference point into a dynamic "H, M, and S" string format.
 * @param unix The Unix timestamp in milliseconds for which the time difference is calculated.
 * @param options An optional object to configure the behavior of the function.
 *
 * @example
 * etaHMS(1703001733955) // returns "1 hour, 0 minutes, and 0 seconds" (from now)
 * etaHMS(1702994533936, { nullIfPast: true }) // returns null */
export function etaHMS(unix: number | string, options?: ETAOptions): string | null {
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
    const seconds = __number.msToSec(difference);

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);

    const h_f = h > 0 ? `${h} ${h === 1 ? "hour" : "hours"}` : "";
    const m_f = m > 0 ? `${m} ${m === 1 ? "minute" : "minutes"}` : "";
    const s_f = s > 0 ? `${s} ${s === 1 ? "second" : "seconds"}` : "";

    const result = [];

    if (h) result.push(h_f);
    if (m) result.push(m_f);
    if (s) result.push(s_f);

    // Grammar adjustment
    if (result.length > 1) result.splice(-1, 0, "and");

    return result.join(", ").replace("and,", "and");
}

/** Format a unix timestamp into a dynamic "Y, MTH, D, H, M, and S" time string format.
 * @param unix The Unix timestamp in milliseconds for which the time difference is calculated.
 * @param options An optional object to configure the behavior of the function.
 *
 * @copyright *Code written by **@fujimori_*** */
export function etaYMDHMS(unix: number | string, options?: ETAOptions): string | null {
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
    const seconds = __number.msToSec(difference);

    /* Break down the counter math */
    const y = Math.floor(seconds / 31536000);
    const mo = Math.floor((seconds % 31536000) / 2628000);
    const d = Math.floor(((seconds % 31536000) % 2628000) / 86400);
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    /* Format the time */
    const yDisplay = y > 0 ? y + (y === 1 ? " year" : " years") : "";
    const moDisplay = mo > 0 ? mo + (mo === 1 ? " month" : " months") : "";
    const dDisplay = d > 0 ? d + (d === 1 ? " day" : " days") : "";
    const hDisplay = h > 0 ? h + (h === 1 ? " hour" : " hours") : "";
    const mDisplay = m > 0 ? m + (m === 1 ? " minute" : " minutes") : "";
    const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";

    // Combine the time in an array
    let result = [];

    if (y) result.push(yDisplay);
    if (mo) result.push(moDisplay);
    if (d) result.push(dDisplay);
    if (h) result.push(hDisplay);
    if (m) result.push(mDisplay);
    if (s) result.push(sDisplay);

    // Shorten time
    if (result.includes(yDisplay)) {
        result.length = 3;
    } else if (result.includes(moDisplay)) {
        result.length = 3;
    } else if (result.includes(dDisplay)) {
        result.length = 3;
    }

    // Filter out empty results
    result = result.filter(f => f);

    // Grammar adjustment
    if (result.length > 1) result.splice(-1, 0, "and");

    return result.join(", ").replace("and,", "and");
}

/**Format a Unix timestamp into a dynamic "DD:HH:MM:SS" time string format.
 * @param unix The Unix timestamp in milliseconds to convert.
 * @param options An optional object to configure the behavior of the function.
 * @copyright *Code written by **@fujimori_*** */
export function etaDigital(unix: number | string, options?: ETAOptions): string | null {
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
    const seconds = __number.msToSec(difference);

    // Break down the counter math
    let d = Math.floor((seconds % 31536000) / 86400);
    let h = Math.floor((seconds % (3600 * 24)) / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor(seconds % 60);

    /* Check if the time is negative */
    if (d < 0) d = Math.abs(d);
    if (h < 0) h = Math.abs(h);
    if (m < 0) m = Math.abs(m);
    if (s < 0) s = Math.abs(s);

    /* Add zeros in front of the number if needed */
    const dDisplay = `0${d}`.slice(-2);
    const hDisplay = `0${h}`.slice(-2);
    const mDisplay = `0${m}`.slice(-2);
    const sDisplay = `0${s}`.slice(-2);

    // Combine the time in an array
    let result = [];

    if (d > 0) result.push(dDisplay);
    if (h > 0 || d > 0) result.push(hDisplay);
    if (m) result.push(mDisplay);
    if (s) result.push(sDisplay);

    // Filter out empty results
    result = result.filter(f => f);

    return result.join(":");
}

export default { parseTime, eta, etaHMS, etaYMDHMS, etaDigital };
