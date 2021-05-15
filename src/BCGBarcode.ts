'use strict';

import { BCGColor } from './BCGColor';
import { BCGLabel } from './BCGLabel';
import { BCGArgumentException } from './BCGArgumentException';
import { imagefilledrectangle, Surface } from './draw';

/**
 * Constructor.
 */
abstract class BCGBarcode {

    /**
     * Used for background color.
     */
    protected static COLOR_BG: number = 0;

    /**
     * Used for foreground color.
     */
    protected static COLOR_FG: number = 1;

    /**
     * Color for the foreground.
     */
    protected colorFg: BCGColor = new BCGColor(0x000000);

    /**
     * Color for the background.
     */
    protected colorBg: BCGColor = new BCGColor(0xffffff);

    /**
     * Scale of the graphic, default: 1.
     */
    protected scale: number = 1;

    /**
     * Position where to start the drawing in X.
     */
    protected offsetX: number = 0;

    /**
     * Position where to start the drawing in Y.
     */
    protected offsetY: number = 0;

    /**
     * Array of BCGLabel.
     */
    protected labels: BCGLabel[] = [];

    /**
     * Push the label, left and top.
     */
    protected pushLabel: number[] = [0, 0];

    constructor() {
    }

    /**
     * Parses the text before displaying it.
     *
     * @param text The text.
     */
    abstract parse(text: string): void;

    /**
     * Gets the foreground color of the barcode.
     *
     * @return The foreground color.
     */
    getForegroundColor(): BCGColor {
        return this.colorFg;
    }

    /**
     * Sets the foreground color of the barcode. It could be a Color
     * value or simply a language code (white, black, yellow...) or hex value.
     *
     * @param color The foreground color.
     */
    setForegroundColor(color: string | BCGColor | number): void {
        if (color instanceof BCGColor) {
            this.colorFg = color;
        } else {
            this.colorFg = new BCGColor(color);
        }
    }

    /**
     * Gets the background color of the barcode.
     *
     * @return The background color.
     */
    getBackgroundColor(): BCGColor {
        return this.colorBg;
    }

    /**
     * Sets the background color of the barcode. It could be a Color
     * value or simply a language code (white, black, yellow...) or hex value.
     *
     * @param color The background color.
     */
    setBackgroundColor(color: string | BCGColor | number): void {
        if (color instanceof BCGColor) {
            this.colorBg = color;
        } else {
            this.colorBg = new BCGColor(color);
        }

        for (let label of this.labels) {
            label.setBackgroundColor(this.colorBg);
        }
    }

    /**
     * Sets the foreground and background color.
     *
     * @param foregroundColor The foreground color.
     * @param backgroundColor The background color.
     */
    setColor(foregroundColor: string | BCGColor | number, backgroundColor: string | BCGColor | number): void {
        this.setForegroundColor(foregroundColor);
        this.setBackgroundColor(backgroundColor);
    }

    /**
     * Gets the scale of the barcode.
     *
     * @return The scale.
     */
    getScale(): number {
        return this.scale;
    }

    /**
     * Sets the scale of the barcode in pixel.
     * If the scale is lower than 1, an exception is raised.
     *
     * @param scale Gets the scale of the barcode.
     */
    setScale(scale: number | string) {
        scale = parseInt(scale?.toString(), 10)
        if (scale <= 0) {
            throw new BCGArgumentException('The scale must be larger than 0.', 'scale');
        }

        this.scale = scale;
    }

    /**
     * Abstract method that draws the barcode on the surface.
     *
     * @param image The surface.
     */
    abstract draw(image: Surface): void;

    /**
     * Returns the maximal size of a barcode.
     * [0]->width
     * [1]->height
     *
     * @param width The width.
     * @param height The height.
     * @return An array, [0] being the width, [1] being the height.
     */
    getDimension(width: number, height: number): [number, number] {
        let labels = this.getBiggestLabels(false);
        let pixelsAround = [0, 0, 0, 0]; // TRBL
        let dimension: number[];

        if (labels[BCGLabel.Position.Top]) {
            dimension = labels[BCGLabel.Position.Top].getDimension();
            pixelsAround[0] += dimension[1];
        }

        if (labels[BCGLabel.Position.Right]) {
            dimension = labels[BCGLabel.Position.Right].getDimension();
            pixelsAround[1] += dimension[0];
        }

        if (labels[BCGLabel.Position.Bottom]) {
            dimension = labels[BCGLabel.Position.Bottom].getDimension();
            pixelsAround[2] += dimension[1];
        }

        if (labels[BCGLabel.Position.Left]) {
            dimension = labels[BCGLabel.Position.Left].getDimension();
            pixelsAround[3] += dimension[0];
        }

        let finalW = (width + this.offsetX) * this.scale;
        let finalH = (height + this.offsetY) * this.scale;

        // This section will check if a top/bottom label is too big for its width and left/right too big for its height
        let reversedLabels = this.getBiggestLabels(true);
        reversedLabels.forEach(function (label) {
            let dimension = label.getDimension();
            let alignment = label.getAlignment();
            let temp: number;
            if (label.getPosition() === BCGLabel.Position.Left || label.getPosition() === BCGLabel.Position.Right) {
                if (alignment === BCGLabel.Alignment.Top) {
                    pixelsAround[2] = Math.max(pixelsAround[2], dimension[1] - finalH);
                } else if (alignment === BCGLabel.Alignment.Center) {
                    temp = Math.ceil((dimension[1] - finalH) / 2);
                    pixelsAround[0] = Math.max(pixelsAround[0], temp);
                    pixelsAround[2] = Math.max(pixelsAround[2], temp);
                } else if (alignment === BCGLabel.Alignment.Bottom) {
                    pixelsAround[0] = Math.max(pixelsAround[0], dimension[1] - finalH);
                }
            } else {
                if (alignment === BCGLabel.Alignment.Left) {
                    pixelsAround[1] = Math.max(pixelsAround[1], dimension[0] - finalW);
                } else if (alignment === BCGLabel.Alignment.Center) {
                    temp = Math.ceil((dimension[0] - finalW) / 2);
                    pixelsAround[1] = Math.max(pixelsAround[1], temp);
                    pixelsAround[3] = Math.max(pixelsAround[3], temp);
                } else if (alignment === BCGLabel.Alignment.Right) {
                    pixelsAround[3] = Math.max(pixelsAround[3], dimension[0] - finalW);
                }
            }
        });

        this.pushLabel[0] = pixelsAround[3];
        this.pushLabel[1] = pixelsAround[0];

        finalW = (width + this.offsetX) * this.scale + pixelsAround[1] + pixelsAround[3];
        finalH = (height + this.offsetY) * this.scale + pixelsAround[0] + pixelsAround[2];

        return [finalW, finalH];
    }

    /**
     * Gets the X offset.
     *
     * @return The X offset.
     */
    getOffsetX(): number {
        return this.offsetX;
    }

    /**
     * Sets the X offset.
     *
     * @param offsetX The X offset.
     */
    setOffsetX(offsetX: number | string): void {
        offsetX = parseInt(offsetX.toString(), 10);
        if (offsetX < 0) {
            throw new BCGArgumentException('The offset X must be 0 or larger.', 'offsetX');
        }

        this.offsetX = offsetX;
    }

    /**
     * Gets the Y offset.
     *
     * @return The Y offset.
     */
    getOffsetY(): number {
        return this.offsetY;
    }

    /**
     * Sets the Y offset.
     *
     * @param offsetY The Y offset.
     */
    setOffsetY(offsetY: number | string): void {
        offsetY = parseInt(offsetY.toString(), 10);
        if (offsetY < 0) {
            throw new BCGArgumentException('The offset Y must be 0 or larger.', 'offsetY');
        }

        this.offsetY = offsetY;
    }

    /**
     * Adds the label to the drawing.
     *
     * @param label The label.
     */
    addLabel(label: BCGLabel): void {
        label.setBackgroundColor(this.colorBg);
        this.labels.push(label);
    }

    /**
     * Removes the label from the drawing.
     *
     * @param label The label.
     */
    removeLabel(label: BCGLabel): void {
        let remove = -1;
        let c = this.labels.length;
        for (let i = 0; i < c; i++) {
            if (this.labels[i] === label) {
                remove = i;
                break;
            }
        }

        if (remove > -1) {
            this.labels.splice(remove, 1);
        }
    }

    /**
     * Clears the labels.
     */
    clearLabels(): void {
        this.labels = [];
    }

    /**
     * Draws the text.
     * The coordinate passed are the positions of the barcode.
     * x1 and y1 represent the top left corner.
     * x2 and y2 represent the bottom right corner.
     *
     * @param image The sutface.
     * @param x1 X1.
     * @param y1 Y1.
     * @param x2 X2.
     * @param y2 Y2.
     */
    protected drawText(image: Surface, x1: number, y1: number, x2: number, y2: number): void {
        this.labels.forEach(label => {
            label.draw(image,
                (x1 + this.offsetX) * this.scale + this.pushLabel[0],
                (y1 + this.offsetY) * this.scale + this.pushLabel[1],
                (x2 + this.offsetX) * this.scale + this.pushLabel[0],
                (y2 + this.offsetY) * this.scale + this.pushLabel[1]);
        });
    }

    /**
     * Draws 1 pixel on the resource at a specific position with a determined color.
     *
     * @param image The surface.
     * @param x The X.
     * @param y The Y.
     * @param color The color.
     */
    protected drawPixel(image: Surface, x: number, y: number, color: number = BCGBarcode.COLOR_FG): void {
        let xR = (x + this.offsetX) * this.scale + this.pushLabel[0];
        let yR = (y + this.offsetY) * this.scale + this.pushLabel[1];

        // We always draw a rectangle
        imagefilledrectangle(image,
            xR,
            yR,
            xR + this.scale - 1,
            yR + this.scale - 1,
            this.getColor(image, color));
    }

    /**
     * Draws an empty rectangle on the resource at a specific position with a determined color.
     *
     * @param image The surface.
     * @param x1 X1.
     * @param y1 Y1.
     * @param x2 X2.
     * @param y2 Y2.
     * @param color The color.
     */
    protected drawRectangle(image: Surface, x1: number, y1: number, x2: number, y2: number, color: number = BCGBarcode.COLOR_FG): void {
        if (this.scale === 1) {
            imagefilledrectangle(image,
                (x1 + this.offsetX) + this.pushLabel[0],
                (y1 + this.offsetY) + this.pushLabel[1],
                (x2 + this.offsetX) + this.pushLabel[0],
                (y2 + this.offsetY) + this.pushLabel[1],
                this.getColor(image, color));
        } else {
            imagefilledrectangle(image, (x1 + this.offsetX) * this.scale + this.pushLabel[0], (y1 + this.offsetY) * this.scale + this.pushLabel[1], (x2 + this.offsetX) * this.scale + this.pushLabel[0] + this.scale - 1, (y1 + this.offsetY) * this.scale + this.pushLabel[1] + this.scale - 1, this.getColor(image, color));
            imagefilledrectangle(image, (x1 + this.offsetX) * this.scale + this.pushLabel[0], (y1 + this.offsetY) * this.scale + this.pushLabel[1], (x1 + this.offsetX) * this.scale + this.pushLabel[0] + this.scale - 1, (y2 + this.offsetY) * this.scale + this.pushLabel[1] + this.scale - 1, this.getColor(image, color));
            imagefilledrectangle(image, (x2 + this.offsetX) * this.scale + this.pushLabel[0], (y1 + this.offsetY) * this.scale + this.pushLabel[1], (x2 + this.offsetX) * this.scale + this.pushLabel[0] + this.scale - 1, (y2 + this.offsetY) * this.scale + this.pushLabel[1] + this.scale - 1, this.getColor(image, color));
            imagefilledrectangle(image, (x1 + this.offsetX) * this.scale + this.pushLabel[0], (y2 + this.offsetY) * this.scale + this.pushLabel[1], (x2 + this.offsetX) * this.scale + this.pushLabel[0] + this.scale - 1, (y2 + this.offsetY) * this.scale + this.pushLabel[1] + this.scale - 1, this.getColor(image, color));
        }
    }

    /**
     * Draws a filled rectangle on the resource at a specific position with a determined color.
     *
     * @param image The surface.
     * @param x1 X1.
     * @param y1 Y1.
     * @param x2 X2.
     * @param y2 Y2.
     * @param color The color.
     */
    protected drawFilledRectangle(image: Surface, x1: number, y1: number, x2: number, y2: number, color: number = BCGBarcode.COLOR_FG): void {
        if (x1 > x2) { // Swap
            x1 ^= x2 ^= x1 ^= x2;
        }

        if (y1 > y2) { // Swap
            y1 ^= y2 ^= y1 ^= y2;
        }

        imagefilledrectangle(image,
            (x1 + this.offsetX) * this.scale + this.pushLabel[0],
            (y1 + this.offsetY) * this.scale + this.pushLabel[1],
            (x2 + this.offsetX) * this.scale + this.pushLabel[0] + this.scale - 1,
            (y2 + this.offsetY) * this.scale + this.pushLabel[1] + this.scale - 1,
            this.getColor(image, color));
    }

    /**
     * Allocates the color based on the integer.
     *
     * @param image The surface.
     * @param color The color.
     * @return The color.
     */
    protected getColor(image: Surface, color: number): { r: number, g: number, b: number } {
        if (color === BCGBarcode.COLOR_BG) {
            return this.colorBg.allocate(image);
        } else {
            return this.colorFg.allocate(image);
        }
    }

    /**
     * Returning the biggest label widths for LEFT/RIGHT and heights for TOP/BOTTOM.
     *
     * @param reversed Reversed.
     * @return Labels.
     */
    private getBiggestLabels(reversed: boolean): BCGLabel[] {
        reversed = !!reversed;

        let searchLR = reversed ? 1 : 0;
        let searchTB = reversed ? 0 : 1;

        let labels: BCGLabel[] = [];
        this.labels.forEach(function (label) {
            let position = label.getPosition();
            if (labels[position]) {
                let savedDimension = labels[position].getDimension();
                let dimension = label.getDimension();
                if (position === BCGLabel.Position.Left || position === BCGLabel.Position.Right) {
                    if (dimension[searchLR] > savedDimension[searchLR]) {
                        labels[position] = label;
                    }
                } else {
                    if (dimension[searchTB] > savedDimension[searchTB]) {
                        labels[position] = label;
                    }
                }
            } else {
                labels[position] = label;
            }
        });

        return labels;
    }
}

export { BCGBarcode }