import __date from "./jT_date";

/** A promise based implementation of {@link setTimeout()}. */
export function sleep(ms: string | number) {
    return new Promise(resolve => setTimeout(resolve, __date.parseTime(ms)));
}

export default { sleep };
