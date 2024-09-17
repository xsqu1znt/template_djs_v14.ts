import * as _dT from "./jT_date";

/** A promise based implementation of {@link setTimeout()}. */
export function sleep(ms: string | number) {
    return new Promise(resolve => setTimeout(resolve, _dT.parseTime(ms)));
}

module.exports = { sleep };
