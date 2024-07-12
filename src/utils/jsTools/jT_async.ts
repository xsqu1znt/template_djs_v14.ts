import * as _dT from "./jT_date";

/** A promise based implementation of setTimeout()
 * @param ms time to wait */
export function sleep(ms: string | number) {
    if (typeof ms === "string") ms = _dT.parseTime(ms);
    else ms = Number(ms);

    if (isNaN(ms)) throw new TypeError(`${ms} is not a valid number`);

    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { sleep };
