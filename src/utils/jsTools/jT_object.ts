/** Return a property value from inside a given object using the provided path.
 * @param obj The object.
 * @param prop A path to a nested property within the object.
 *
 * ```ts
 * // returns 5
 * let obj = { a: 5 };
 * getProp(obj, "a");
 *
 * // returns "hello, world!"
 * let obj = { a: [{ content: "hello, world!" }] };
 * getProp(obj, "a[0].content");
 * ``` */
export function getProp<V extends object, K extends keyof V>(obj: V, prop: K): V[K] | V {
    if (typeof obj !== "object") throw new TypeError("You must provide a valid object");
    if (typeof prop !== "string") throw new TypeError("You must provide a valid path string");
    if (!prop.trim()) return obj;

    let propNew = prop
        // Strip whitespace
        .trim()
        // Replace array indexes with property index values
        .replace(/\[(\w+)\]/g, ".$1")
        // Strip leading dots
        .replace(/^\./, "");

    // Split path into an array of property names
    let _path = propNew.split(".");

    // Used for debugging where we were at before throwing an error
    let debug_path = [];

    // Iterate through each property path strings
    for (let i = 0; i < _path.length; ++i) {
        // Get the current property path we're at
        let prop = _path[i];

        // DEBUGGING
        debug_path.push(prop);

        try {
            // Check if the property exists
            if (prop in obj && obj[prop] === undefined)
                throw new Error(`Object property \'${debug_path.join(".")}\' is undefined`);

            // Set obj to the new value
            obj = obj[prop];
        } catch {
            throw new Error(`Cannot get property \'${prop}\' from \'${obj}\'`);
        }
    }

    return obj;
}
