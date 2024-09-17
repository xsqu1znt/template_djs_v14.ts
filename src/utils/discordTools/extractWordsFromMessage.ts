import { Message } from "discord.js";

interface ExtractWordsFromMessageOptions {
    /** The amount of embeds to parse in the message. Defaults to `null` (unlimited). */
    embedDepth: number | null;
    /** Whether the returned strings should be lowercase. */
    lowercaseify: boolean;
}

/** Returns every word in the given message, including from `Embeds`. */
export default function extractWordsFromMessage(message: Message, options?: ExtractWordsFromMessageOptions): string[] {
    const _options = {
        embedDepth: null,
        lowercaseify: true,
        ...options
    };

    const content = [];

    if (message.content) {
        content.push(...message.content.split(" "));
    }

    if (message?.embeds?.length) {
        // Go through the embeds
        for (let embed of message.embeds.slice(0, _options.embedDepth ?? message.embeds.length - 1)) {
            if (embed?.title) content.push(...embed.title.split(" "));
            if (embed?.author?.name) content.push(...embed.author.name.split(" "));

            if (embed?.description) content.push(...embed.description.split(" "));

            if (embed?.fields?.length) {
                for (let field of embed.fields) {
                    if (field?.name) content.push(...field.name.split(" "));
                    if (field?.value) content.push(...field.value.split(" "));
                }
            }

            if (embed?.footer?.text) content.push(...embed.footer.text.split(" "));
        }
    }

    // Parse and return content
    return content.map(str => (_options.lowercaseify ? str.toLowerCase() : str).trim()).filter(str => str);
}
