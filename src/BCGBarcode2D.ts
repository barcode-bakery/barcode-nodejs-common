'use strict';

/*!
 * Copyright (C) Jean-Sebastien Goupil
 * http://www.barcodebakery.com
 */

import { BCGArgumentException } from './BCGArgumentException';
import { BCGBarcode } from './BCGBarcode';
import { imagefilledrectangle, Surface } from './draw';

/**
 * Constructor.
 */
abstract class BCGBarcode2D extends BCGBarcode {
    /**
     * The X multipled by this scale.
     */
    protected scaleX: number = 1;

    /**
     * The Y multipled by this scale.
     */
    protected scaleY: number = 1;

    constructor() {
        super();
    }

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
        return super.getDimension(width * this.scaleX, height * this.scaleY);
    }

    /**
     * Sets the scale of the barcode in pixel for X.
     * If the scale is lower than 1, an exception is raised.
     *
     * @param scaleX The X scale.
     */
    protected setScaleX(scaleX: number | string): void {
        scaleX = parseInt(scaleX.toString(), 10);
        if (scaleX <= 0) {
            throw new BCGArgumentException('The scale must be larger than 0.', 'scaleX');
        }

        this.scaleX = scaleX;
    }

    /**
     * Sets the scale of the barcode in pixel for Y.
     * If the scale is lower than 1, an exception is raised.
     *
     * @param int scaleY The Y scale.
     */
    protected setScaleY(scaleY: number | string): void {
        scaleY = parseInt(scaleY.toString(), 10);
        if (scaleY <= 0) {
            throw new BCGArgumentException('The scale must be larger than 0.', 'scaleY');
        }

        this.scaleY = scaleY;
    }

    /**
     * Draws the text.
     * The coordinate passed are the positions of the barcode.
     * x1 and y1 represent the top left corner.
     * x2 and y2 represent the bottom right corner.
     *
     * @param image The surface.
     * @param x1 X1.
     * @param y1 Y1.
     * @param x2 X2.
     * @param y2 Y2.
     */
    protected drawText(image: Surface, x1: number, y1: number, x2: number, y2: number): void {
        for (let label of this.labels) {
            label.draw(image,
                (x1 + this.offsetX) * this.scale * this.scaleX + this.pushLabel[0],
                (y1 + this.offsetY) * this.scale * this.scaleY + this.pushLabel[1],
                (x2 + this.offsetX) * this.scale * this.scaleX + this.pushLabel[0],
                (y2 + this.offsetY) * this.scale * this.scaleY + this.pushLabel[1]);
        }
    }

    /**
     * Draws 1 pixel on the resource at a specific position with a determined color.
     *
     * @param image The surface.
     * @param x X.
     * @param y Y.
     * @param colorThe color.
     */
    protected drawPixel(image: Surface, x: number, y: number, color: number = BCGBarcode.COLOR_FG): void {
        let scaleX = this.scale * this.scaleX;
        let scaleY = this.scale * this.scaleY;

        let xR = (x + this.offsetX) * scaleX + this.pushLabel[0];
        let yR = (y + this.offsetY) * scaleY + this.pushLabel[1];

        // We always draw a rectangle
        imagefilledrectangle(image,
            xR,
            yR,
            xR + scaleX - 1,
            yR + scaleY - 1,
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
        let scaleX = this.scale * this.scaleX;
        let scaleY = this.scale * this.scaleY;

        if (this.scale === 1) {
            imagefilledrectangle(image,
                (x1 + this.offsetX) * scaleX + this.pushLabel[0],
                (y1 + this.offsetY) * scaleY + this.pushLabel[1],
                (x2 + this.offsetX) * scaleX + this.pushLabel[0],
                (y2 + this.offsetY) * scaleY + this.pushLabel[1],
                this.getColor(image, color));
        } else {
            imagefilledrectangle(image, (x1 + this.offsetX) * scaleX + this.pushLabel[0], (y1 + this.offsetY) * scaleY + this.pushLabel[1], (x2 + this.offsetX) * scaleX + scaleX - 1 + this.pushLabel[0], (y1 + this.offsetY) * scaleY + scaleY - 1 + this.pushLabel[1], this.getColor(image, color));
            imagefilledrectangle(image, (x1 + this.offsetX) * scaleX + this.pushLabel[0], (y1 + this.offsetY) * scaleY + this.pushLabel[1], (x1 + this.offsetX) * scaleX + scaleX - 1 + this.pushLabel[0], (y2 + this.offsetY) * scaleY + scaleY - 1 + this.pushLabel[1], this.getColor(image, color));
            imagefilledrectangle(image, (x2 + this.offsetX) * scaleX + this.pushLabel[0], (y1 + this.offsetY) * scaleY + this.pushLabel[1], (x2 + this.offsetX) * scaleX + scaleX - 1 + this.pushLabel[0], (y2 + this.offsetY) * scaleY + scaleY - 1 + this.pushLabel[1], this.getColor(image, color));
            imagefilledrectangle(image, (x1 + this.offsetX) * scaleX + this.pushLabel[0], (y2 + this.offsetY) * scaleY + this.pushLabel[1], (x2 + this.offsetX) * scaleX + scaleX - 1 + this.pushLabel[0], (y2 + this.offsetY) * scaleY + scaleY - 1 + this.pushLabel[1], this.getColor(image, color));
        }
    }

    /**
     * Draws a filled rectangle on the resource at a specific position with a determined color.
     *
     * @param image The image
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

        let scaleX = this.scale * this.scaleX;
        let scaleY = this.scale * this.scaleY;

        imagefilledrectangle(image,
            (x1 + this.offsetX) * scaleX + this.pushLabel[0],
            (y1 + this.offsetY) * scaleY + this.pushLabel[1],
            (x2 + this.offsetX) * scaleX + scaleX - 1 + this.pushLabel[0],
            (y2 + this.offsetY) * scaleY + scaleY - 1 + this.pushLabel[1],
            this.getColor(image, color));
    }
}

export { BCGBarcode2D }
