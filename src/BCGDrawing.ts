'use strict';

import { DrawPNG, DrawBasic, imagecreatetruecolor, imagefilledrectangle, Draw, Surface } from './draw';
import { BCGDrawException } from './BCGDrawException';
import { BCGBarcode } from './BCGBarcode';
import { BCGColor } from './BCGColor';
import { setColor, setFont } from './Utility';
import { BCGFont } from './BCGFont';
import { draw } from '.';

class BCGDrawing {
    private w: number = 0;
    private h: number = 0;
    private image: Surface | null;
    private dpi: number | null = null;
    private rotateDegree: number = 0.0;
    private barcode: BCGBarcode | null;
    private exceptionToDraw: Error | null = null;
    private color: BCGColor = new BCGColor(0xffffff);

    /**
     * Creates a drawing surface by indicating its background color.
     *
     * @param barcode The barcode.
     * @param Color The background color.
     */
    constructor(barcode?: BCGBarcode | null, color?: BCGColor | null) {
        this.barcode = barcode || null;

        this.image = null;
        if (color) {
            this.color = color;
        }
    }

    /**
     * Gets the image resource.
     *
     * @return The surface abstraction where the barcode is drawn
     */
    getImage(): Surface | null {
        return this.image;
    }

    /**
     * Sets the image resource.
     *
     * @param image The surface
     */
    setImage(image: Surface): void {
        this.image = image;
    }

    /**
     * Gets barcode for drawing.
     *
     * @return The barcode.
     */
    getBarcode(): BCGBarcode | null {
        return this.barcode;
    }

    /**
     * Gets the DPI for supported filetype.
     *
     * @return The DPI.
     */
    getDPI(): number | null {
        return this.dpi;
    }

    /**
     * Sets the DPI for supported filetype.
     *
     * @param dpi The DPI.
     */
    setDPI(dpi: number): void {
        this.dpi = dpi;
    }

    /**
     * Gets the rotation angle in degree. The rotation is clockwise.
     *
     * @return The rotation angle.
     */
    getRotationAngle(): number {
        return this.rotateDegree;
    }

    /**
     * Sets the rotation angle in degree. The rotation is clockwise.
     *
     * @param degree Rotation angle in degree.
     */
    setRotationAngle(degree: number | string): void {
        this.rotateDegree = parseFloat(degree?.toString());
    }

    toBuffer(format: BCGDrawing.ImageFormat, callback?: (err: Error | null, data: Buffer) => void) {
        this.draw(format);
        let drawer = getDrawerFromFormat(format, this.image!, this.dpi); // !Done in draw.
        return drawer.toBuffer(callback);
    }

    toBufferSync(format: BCGDrawing.ImageFormat) {
        return this.toBuffer(format);
    }

    save(fileName: string, callback?: (err: NodeJS.ErrnoException) => void): void;
    save(fileName: string, format: BCGDrawing.ImageFormat, callback?: (err: NodeJS.ErrnoException) => void): void;
    save(fileName: string, arg2?: ((err: NodeJS.ErrnoException) => void) | BCGDrawing.ImageFormat, callback?: (err: NodeJS.ErrnoException) => void) {
        let format: BCGDrawing.ImageFormat;
        if (typeof arg2 === 'function') {
            callback = arg2;
            arg2 = undefined;
        }

        if (typeof arg2 !== 'function' && arg2) {
            format = arg2;
        } else {
            format = getFormatFromFileName(fileName);
        }

        this.draw(format);
        let drawer = getDrawerFromFormat(format, this.image!, this.dpi); // !Done in draw.
        drawer.toFile(fileName, callback);
    }

    /**
     * Draws the barcode in a file asynchronously
     *
     * @param fileName The file name.
     * @param format The image format.
     */
    saveSync(fileName: string, format: BCGDrawing.ImageFormat): void {
        return this.save(fileName, format);
    }

    /**
     * Writes the Error on the picture.
     *
     * @param Exception $exception
     */
    drawException(exception: Error): void {
        this.exceptionToDraw = exception;
    }

    private draw(format: BCGDrawing.ImageFormat) {
        if (this.exceptionToDraw != null || this.barcode == null) {
            let message = this.exceptionToDraw?.message ?? 'No barcode available';
            let ctx = imagecreatetruecolor(1, 1);
            setFont(ctx, 'Arial', '14pt');
            let box = ctx.measureText(message);

            let finalWidth = box.actualBoundingBoxRight - box.actualBoundingBoxLeft + 1;
            let finalHeight = box.actualBoundingBoxAscent + box.actualBoundingBoxDescent + 1;

            this.image = imagecreatetruecolor(finalWidth, finalHeight);
            imagefilledrectangle(this.image, 0, 0, finalWidth - 1, finalHeight - 1, this.color.allocate(this.image));
            let font = new BCGFont('Arial', 14);
            font.setText(message);
            font.setRotationAngle(this.getRotationAngle());
            font.draw(this.image, 0, 0);
        } else {
            let size = this.barcode.getDimension(0, 0);
            this.w = Math.max(1, size[0]);
            this.h = Math.max(1, size[1]);
            this.init(format);
            this.barcode.draw(this.image!); // !Done in init.
        }
    }

    /**
     * Init Image and color background.
     */
    private init(format: BCGDrawing.ImageFormat) {
        if (this.image === null) {
            this.image = imagecreatetruecolor(this.w, this.h);
            imagefilledrectangle(this.image, 0, 0, this.w - 1, this.h - 1, this.color.allocate(this.image));
        }
    }
}

namespace BCGDrawing {
    export enum ImageFormat {
        Png = 1,
        Jpeg,
        Gif,
        Wbmp,
        //Svg
    }
}

function getDrawerFromFormat(format: BCGDrawing.ImageFormat, image: draw.Surface, dpi: number | null): Draw {
    let drawer: Draw | null = null;
    switch (format) {
        case BCGDrawing.ImageFormat.Png:
            drawer = new DrawPNG(image);
            break;
        default:
            drawer = new DrawBasic(image);
            break;
    }

    if (drawer) {
        drawer.setDPI(dpi);
        return drawer;
    }

    throw new BCGDrawException('There are no drawers for this format.');
}

function getFormatFromFileName(fileName: string): BCGDrawing.ImageFormat {
    let extension = getExtension(fileName).toUpperCase();
    switch (extension) {
        case '.PNG':
            return BCGDrawing.ImageFormat.Png;
        case '.JPG':
        case '.JPEG':
            return BCGDrawing.ImageFormat.Jpeg
        case '.GIF':
            return BCGDrawing.ImageFormat.Gif;

        // Not supported yet.
        //case '.SVG':
        //    return BCGDrawing.ImageFormat.Svg;
    }

    throw new BCGDrawException('The format cannot be found based on the filename, specify a format.');
}

function getExtension(fileName: string): string {
    let i = fileName.lastIndexOf('.');
    return (i < 0) ? '' : fileName.substr(i);
}

export { BCGDrawing }
