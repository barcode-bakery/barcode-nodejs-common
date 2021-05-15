'use strict';

import canvas from 'canvas';
import { writeFile, writeFileSync } from 'fs';
import { setColor } from './Utility';

export type Surface = canvas.CanvasRenderingContext2D;

export function imagecreatetruecolor(width: number, height: number, type?: 'pdf' | 'svg'): Surface {
    let c = canvas.createCanvas(width, height, type);
    return c.getContext('2d');
}

export function imagecolortransparent(image: Surface, allocated: { r: number, g: number, b: number }): { r: number, g: number, b: number } {
    // TODO
    return { r: 0, g: 0, b: 0 };
}

export function imagedestroy(image: Surface | null): void {
    // We don't have to do anything here
}

export function imagesx(image: Surface): number {
    return image.canvas.width;
}

export function imagesy(image: Surface): number {
    return image.canvas.height;
}

export function imagefill(image: Surface, x: number, y: number, color: { r: number, g: number, b: number }): void {
    // We don't use x and y here
    setColor(image, color);
    image.fillRect(0, 0, image.canvas.width, image.canvas.height);
}

export function imagefilledrectangle(image: Surface, x1: number, y1: number, x2: number, y2: number, color: { r: number, g: number, b: number }): void {
    setColor(image, color);
    image.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
}

export function imagecolorallocate(image: Surface, red: number, green: number, blue: number): { r: number, g: number, b: number } {
    return { r: red, g: green, b: blue };
}

export function imagecopy(): void { }

export function imagefontwidth(): void { }
export function imagefontheight(): void { }
export function imagestring(): void { }

export abstract class Draw {
    protected image: Surface;
    protected dpi: number | null = null;
    constructor(image: Surface) {
        this.image = image;
    }

    setDPI(dpi: number | string | null): void {
        let temp = parseFloat(dpi?.toString() || '')
        if (!isNaN(temp) && isFinite(temp)) {
            throw new Error('Not yet implemented');
            this.dpi = Math.max(1, temp);
        } else {
            this.dpi = null;
        }
    }

    abstract toFile(fileName: string, callback?: (err: NodeJS.ErrnoException) => void): void;
    abstract toBuffer(callback?: (err: Error | null, data: Buffer) => void): void;
}

export class DrawBasic extends Draw {
    constructor(image: Surface) {
        super(image);
    }

    toFile(fileName: string, callback?: (err: NodeJS.ErrnoException) => void): void {
        // We are async
        if (callback) {
            (this.image.canvas as any).toBuffer(function (err: Error | null, data: Buffer) {
                writeFile(fileName, data, 'utf8', callback);
            });
        } else {
            writeFileSync(fileName, (this.image.canvas as any).toBuffer(), 'utf8');
        }
    }

    toBuffer(callback?: (err: Error | null, data: Buffer) => void) {
        return (this.image.canvas as any).toBuffer(callback);
    }
}

export class DrawPNG extends Draw {
    constructor(image: Surface) {
        super(image);
    }

    toFile(fileName: string, callback?: (err: NodeJS.ErrnoException) => void): void {
        // We are async
        if (callback) {
            (this.image.canvas as any).toBuffer(function (err: Error | null, data: Buffer) {
                writeFile(fileName, data, 'utf8', callback);
            });
        } else {
            writeFileSync(fileName, (this.image.canvas as any).toBuffer(), 'utf8');
        }
    }

    toBuffer(callback?: (err: Error | null, data: Buffer) => void) {
        return (this.image.canvas as any).toBuffer(callback);
    }
}
