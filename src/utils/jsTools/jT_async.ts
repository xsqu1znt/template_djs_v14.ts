import { setTimeout } from "node:timers/promises";
import __date from "./jT_date";

/** A wrapper of {@link setTimeout}. */
export async function sleep(ms: string | number): Promise<void> {
    return await setTimeout(__date.parseTime(ms));
}

export class LoopInterval<T extends (...args: any) => any> {
    #onCallback: (...args: any) => any;
    #loop: boolean;

    /** Run a callback function every interval. This will wait for async callbacks to complete before running it back.
     * @param callback The callback that will be ran at each interval.
     * @param delay The time to wait before running the callback again.
     *
     * This parameter utilizes {@link __date.parseTime jsTools.parseTime}, letting you use "10s" or "1m 30s" instead of a number. */
    constructor(callback: T, delay: string | number) {
        this.#onCallback = () => {};
        this.#loop = true;

        const runItBack = async (): Promise<void> => {
            // Execute the callback and get the return value
            const returnValue = await callback();
            // Execute the listener
            this.#onCallback(returnValue);

            if (this.#loop) {
                await sleep(__date.parseTime(delay));
                runItBack();
            }
        };

        runItBack();
    }

    /** Stop the loop. */
    stop(): void {
        this.#loop = false;
    }

    /** Set the function to call each time the callback completes.
     * @param callback The function to call when the loop finishes. */
    on(callback: (arg: Awaited<ReturnType<T>>) => any): void {
        this.#onCallback = callback;
    }
}

export default { sleep, LoopInterval };
