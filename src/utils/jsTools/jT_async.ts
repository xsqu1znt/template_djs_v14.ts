import { setTimeout } from "node:timers/promises";
import { EventEmitter } from "node:stream";
import __date from "./jT_date";

type AnyFunc = (...args: any) => any;

interface LoopIntervalEvents {
    executed: [any];
    bumped: [any];
    started: [];
    stopped: [];
}

interface __LoopIntervalEvents {
    execute: [];
    bump: [];
    start: [boolean];
    stop: [];
}

/** A wrapper of {@link setTimeout}. */
export async function sleep(ms: string | number): Promise<void> {
    return await setTimeout(__date.parseTime(ms));
}

export class LoopInterval<T extends AnyFunc> {
    private running: boolean = false;
    private delay: number;

    EventEmitter: EventEmitter<LoopIntervalEvents> = new EventEmitter();
    private __eventEmitter: EventEmitter<__LoopIntervalEvents> = new EventEmitter();

    /** Run a function every interval. If the function is asyncronous, it will wait for completion.
     * @param fn The function that will be run.
     * @param delay The time to wait before running the function again.
     * @param immediate Whether to run the function immediately after initialization. Defaults to `true`.
     *
     * This parameter utilizes {@link __date.parseTime jsTools.parseTime}, letting you use "10s" or "1m 30s" instead of a number. */
    constructor(fn: T, delay: string | number, immediate: boolean = true) {
        this.delay = __date.parseTime(delay);

        const main = async () => {
            if (!this.running) return this.__eventEmitter.emit("stop");
            // Both call the function and emit the executed event
            this.EventEmitter.emit("executed", await fn());
        };

        this.__eventEmitter.on("execute", async () => main);

        this.EventEmitter.on("executed", () => {
            if (this.running) {
                sleep(this.delay).then(() => this.__eventEmitter.emit("execute"));
            }
        });

        this.__eventEmitter.on("bump", async () => this.EventEmitter.emit("bumped", await fn()));

        this.__eventEmitter.on("start", _immediate => {
            if (this.running) return;

            this.running = true;
            this.__eventEmitter.removeAllListeners("execute");
            this.__eventEmitter.on("execute", main);
            this.EventEmitter.emit("started");

            if (_immediate) {
                this.__eventEmitter.emit("execute");
            } else {
                sleep(this.delay).then(() => this.__eventEmitter.emit("execute"));
            }
        });

        this.__eventEmitter.on("stop", () => {
            this.running = false;
            this.__eventEmitter.removeAllListeners("execute");
            this.EventEmitter.emit("stopped");
        });

        // Start
        this.__eventEmitter.emit("start", immediate);
    }

    /** Change the delay of the loop.
     * @param delay The delay.
     * This parameter utilizes {@link __date.parseTime jsTools.parseTime}, letting you use "10s" or "1m 30s" instead of a number. */
    setDelay(delay: string | number): this {
        this.delay = __date.parseTime(delay);
        return this;
    }

    /** Start the loop if it was stopped.
     * @param immediate Whether to start immediately. */
    start(immediate: boolean = false): this {
        this.__eventEmitter.emit("start", immediate);
        return this;
    }

    /** Stop the loop. */
    stop(): this {
        this.__eventEmitter.emit("stop");
        return this;
    }

    /** Manually trigger the callback. */
    execute(): this {
        this.__eventEmitter.emit("bump");
        return this;
    }

    /** Add a listener to call each time a cycle completes.
     * @param fn The function to call. */
    on(fn: (arg: Awaited<ReturnType<T>>) => any): this {
        this.EventEmitter.on("executed", fn);
        return this;
    }

    /** Add a listener to call once a cycle completes.
     * @param fn The function to call. */
    once(fn: (arg: Awaited<ReturnType<T>>) => any): this {
        this.EventEmitter.once("executed", fn);
        return this;
    }

    /** Remove a listener from the cycle.
     * @param fn The function to remove. */
    off(fn: (arg: Awaited<ReturnType<T>>) => any): this {
        this.EventEmitter.off("executed", fn);
        return this;
    }
}

export default { sleep, LoopInterval };
