import { AvifConfig, Canvas, createCanvas, GlobalFonts, Image, loadImage, SKRSContext2D } from "@napi-rs/canvas";
import { join } from "path";

export type MimeType = "image/avif" | "image/jpeg" | "image/png" | "image/webp";
export type ImageResolveable = string | URL | Buffer | ArrayBufferLike | Uint8Array | Image | import("stream").Readable;
export type ColorHex = `#${string}`;

const imageCache: Map<string, Image> = new Map();

interface CanvasOptions {
    fillColor: ColorHex;

    textColor: ColorHex;
    font: string;
    fontSize: number;
    textAlignment: CanvasTextAlign;
}

interface TextOptions {
    x: number;
    y: number;
    color: ColorHex;
    font: string;
    size: number;
    align: CanvasTextAlign;
    style?: "bold" | "italic" | "underline";
    placeInside?: { x: number; y: number; width: number; height: number };
}

interface ImageOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    rounded: boolean | number;
    padding?: number | { x: number; y: number };
    placeInside?: { x: number; y: number; width: number; height: number };
}

export default class CanvasBuilder {
    canvas: Canvas;
    ctx: SKRSContext2D;

    options: CanvasOptions = {
        fillColor: "#ffffff",

        textColor: "#000000",
        font: "serif",
        fontSize: 12,
        textAlignment: "left"
    };

    constructor(public width: number, public height: number, options: Partial<CanvasOptions> = {}) {
        this.options = { ...this.options, ...options };

        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.save();
    }

    #tempCanvas() {
        const tempCanvas = createCanvas(this.width, this.height);
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.save();
        return { canvas: tempCanvas, ctx: tempCtx };
    }

    async #loadImage(source: ImageResolveable) {
        /* Get the image from cache, if applicable */
        if (source instanceof URL && imageCache.has(source.href)) imageCache.get(source.href);
        else if (typeof source === "string" && imageCache.has(source)) imageCache.get(source);

        const image = await loadImage(source);

        /* Add image to cache, if applicable */
        if (source instanceof URL) imageCache.set(source.href, image);
        else if (typeof source === "string") imageCache.set(source, image);

        // Return the image
        return image;
    }

    /** Load a font from the specified path and assign it to an alias.
     * Returns whether the font was loaded successfully.
     * @param path Path to the font file.
     * @param alias The alias to assign to the font.
     * @param relative Whether the path is relative to `process.cwd()`. */
    loadFont(path: string, alias: string, relative: boolean = true): boolean {
        return GlobalFonts.registerFromPath(relative ? join(process.cwd(), path) : path, alias);
    }

    measureText(text: string): TextMetrics {
        return this.ctx.measureText(text);
    }

    clear(x: number = 0, y: number = 0, width: number = this.width, height: number = this.height) {
        this.ctx.clearRect(x, y, width, height);
    }

    setBackgroundColor(color: ColorHex = this.options.fillColor) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }

    async setBackgroundImage(source: ImageResolveable) {
        const image = await this.#loadImage(source);
        this.ctx.drawImage(image, 0, 0, this.width, this.height);
        this.ctx.restore();
    }

    fillText(text: string, options: Partial<TextOptions> = {}) {
        const _options: TextOptions = {
            x: 0,
            y: 0,
            color: this.options.textColor,
            font: this.options.font,
            size: this.options.fontSize,
            align: this.options.textAlignment,
            ...options
        };

        this.ctx.fillStyle = _options.color;
        this.ctx.font = `${_options.style || ""}${_options.size}px ${_options.font}`.trim();
        this.ctx.textAlign = _options.align;

        if (_options.placeInside) {
            const { x, y, width, height } = _options.placeInside;
            const metrics = this.ctx.measureText(text);
            this.ctx.textAlign = "center";
            this.ctx.fillText(text, x + _options.x + width / 2, y + _options.y + height / 2 + metrics.emHeightAscent / 2);
        } else {
            this.ctx.fillText(text, _options.x, _options.y);
        }

        this.ctx.restore();
    }

    async drawImage(source: ImageResolveable, options: Partial<ImageOptions> = {}) {
        const image = await this.#loadImage(source);
        if (!image) throw new Error(`Image source is not valid.`);

        const _options: ImageOptions = {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
            rounded: false,
            ...options
        };

        const px = (typeof _options.padding === "number" ? _options.padding : _options.padding?.x) || 0;
        const py = (typeof _options.padding === "number" ? _options.padding : _options.padding?.y) || 0;

        const _draw = (_ctx: SKRSContext2D, mergeWithMainCanvas: boolean) => {
            if (_options.placeInside) {
                const { x, y, width, height } = _options.placeInside;

                _ctx.drawImage(
                    image,
                    x + _options.x + width / 2 - _options.width / 2 - px,
                    y + _options.y + height / 2 - _options.height / 2 - py,
                    _options.width,
                    _options.height
                );
            } else {
                _ctx.drawImage(image, _options.x + px, _options.y + py, _options.width, _options.height);
            }

            if (mergeWithMainCanvas) {
                this.ctx.drawImage(_ctx.canvas, 0, 0);
            }

            _ctx.restore();
        };

        const _clip = (_ctx: SKRSContext2D) => {
            if (!_options.rounded) return;

            let x: number = 0,
                y: number = 0;

            if (_options.placeInside) {
                const { x: _x, y: _y, width: _width, height: _height } = _options.placeInside;
                x = _options.x + _width / 2 - _options.width / 2 - px;
                y = _options.y + _height / 2 - _options.height / 2 - py;
            } else {
                x = _options.x + px;
                y = _options.y + py;
            }

            if (typeof _options.rounded === "number") {
                _ctx.beginPath();
                _ctx.moveTo(_options.x + _options.rounded, _options.y);
                _ctx.arcTo(x + _options.width, y, x + _options.width, y + _options.height, _options.rounded);
                _ctx.arcTo(x + _options.width, y + _options.height, x, y + _options.height, _options.rounded);
                _ctx.arcTo(x, y + _options.height, x, y, _options.rounded);
                _ctx.arcTo(x, y, x + _options.width, y, _options.rounded);
                _ctx.closePath();
                _ctx.clip();
            } else {
                _ctx.beginPath();
                _ctx.arc(x + _options.width / 2, y + _options.height / 2, _options.width / 2, 0, 2 * Math.PI);
                _ctx.closePath();
                _ctx.clip();
            }
        };

        if (_options.rounded) {
            const { ctx } = this.#tempCanvas();
            _clip(ctx);
            _draw(ctx, true);
            ctx.restore();
        } else {
            _clip(this.ctx);
            _draw(this.ctx, false);
            this.ctx.restore();
        }
    }

    toBuffer(mime: "image/png"): Buffer;
    toBuffer(mime: "image/avif", cfg?: AvifConfig): Buffer;
    toBuffer(mime: "image/jpeg" | "image/webp", quality?: number): Buffer;
    toBuffer(mime: MimeType, cfgOrQuality?: AvifConfig | number): Buffer {
        switch (mime) {
            case "image/avif":
                return this.canvas.toBuffer("image/avif", cfgOrQuality as AvifConfig);
            case "image/jpeg":
                return this.canvas.toBuffer("image/jpeg", cfgOrQuality as number);
            case "image/webp":
                return this.canvas.toBuffer("image/webp", cfgOrQuality as number);
            case "image/png":
                return this.canvas.toBuffer("image/png");
        }
    }
}
