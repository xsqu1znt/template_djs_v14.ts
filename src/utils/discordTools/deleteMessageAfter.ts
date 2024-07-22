import { Message } from "discord.js";
import jt from "@utils/jsTools";

import { timeouts } from "./config.json";

export async function deleteMessageAfter(
    message: Message | Promise<Message>,
    delay: string | number = timeouts.ERROR_MESSAGE
): Promise<Message | null> {
    delay = jt.parseTime(delay);

    // Ensure the message is resolved
    message = await Promise.resolve(message);

    // Await the given time
    await jt.sleep(delay);

    // Check if the message is deletable
    if (!message.deletable) return null;
    return await message.delete().catch(() => null);
}
