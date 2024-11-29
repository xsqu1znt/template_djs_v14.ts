export type ANSIFormat = "normal" | "bold" | "underline";
export type ANSITextColor = "gray" | "red" | "green" | "yellow" | "blue" | "pink" | "cyan" | "white";
export type ANSIBGColor =
    | "firefly_dark_blue"
    | "orange"
    | "marble_blue"
    | "grayish_turqouise"
    | "gray"
    | "indigo"
    | "light_gray"
    | "white";

interface ANSITextOptions {
    format?: ANSIFormat;
    color?: ANSITextColor;
    bgColor?: ANSIBGColor;
}

import config from "./config.json";

export default class ANSIBuilder {
    #stringArray: string[] = [];

    constructor(text?: string, options?: ANSITextOptions) {
        if (text) this.addLines({ text, options: options ?? {} });
    }

    addLines(...lines: { text: string; options: ANSITextOptions }[]): this {
        for (const line of lines) {
            const ansi = "$ESC[$FORMAT;$BG_COLOR;$TEXT_COLORm$TEXT$ESC[0m"
                .replace(/\$ESC/g, config.ansi.ESCAPE)
                .replace("$FORMAT", `${config.ansi.formats[line.options.format ?? ("normal" as ANSIFormat)]}`)
                .replace("$BG_COLOR;", line.options.bgColor ? `${config.ansi.colors.bg[line.options.bgColor]};` : "")
                .replace("$TEXT_COLOR", line.options.color ? `${config.ansi.colors.text[line.options.color]}` : "")
                .replace("$TEXT", line.text);

            this.#stringArray.push(ansi);
        }

        return this;
    }

    toString(codeblock: boolean = false): string {
        const ansi = this.#stringArray.join("\n");
        return codeblock ? `\`\`\`ansi\n${ansi}\n\`\`\`` : ansi;
    }
}
