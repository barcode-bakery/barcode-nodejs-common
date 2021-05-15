'use strict';

import { Surface } from './draw';

export function arraySearch(arr: string[], val: string): number {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            return i;
        }
    }

    return -1;
}

export function substrCount(haystack: string, needle: string): number {
    let count = -1,
        previousPos = 0;
    while (previousPos >= 0) {
        previousPos = haystack.indexOf(needle, previousPos);
        count++;
        if (previousPos >= 0) {
            previousPos += needle.length;
        }
    }

    return count;
}

export function strRepeat(input: string, multiplier: number): string {
    return Array(multiplier + 1).join(input);
}


export function stringSplit(text: string, splitLength: number): string[] {
    let arr: string[] = [];
    let counter = 0;
    while (counter * splitLength < text.length) {
        arr.push(text.substr(counter * splitLength, splitLength));
        counter++;
    }

    return arr;
}

export function setColor(image: Surface, color: { r: number, g: number, b: number }): void {
    image.fillStyle = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
}

export function setFont(image: Surface, font: string, size: string): void {
    image.font = size + ' ' + font;
}

export function regexpQuote(str: string): string {
    return str.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
}

export function strrev(str: string): string {
    return (str || '').split('').reverse().join('');
}

export function clone<T>(obj: T & { [key: string]: any, clone?: () => T }): T {
    let cloned: any = {};

    if (obj.clone) {
        return obj.clone();
    }

    for (let i in obj) {
        if (typeof obj[i] === 'object') {
            cloned[i] = clone(obj[i]);
        } else {
            cloned[i] = obj[i];
        }
    }

    return cloned as T;
};

export function arraySum(array: number[]): number {
    return array.reduce(function (a, b) {
        return a + b;
    });
}

export function isInt(num: number): boolean {
    return num === (num | 0);
}

export function bindec(binary: number | string): number {
    binary = (binary + '').replace(/[^01]/gi, '');
    return parseInt(binary, 2);
}

export function decbin(number: number): string {
    return (number >>> 0).toString(2);
}

export function print_r(): string {
    return '';
}

export function strSplit(str: string, length: number): string[] | null {
    if (str == null || !str.toString || length < 1) {
        return null;
    }

    return str.toString().match(new RegExp('.{1,' + (length || '1') + '}', 'g'));
}

export function isNumeric(input: string): boolean {
    return /^[0-9]+[\.,]{0,1}[0-9]*$/i.test(input);
}

export function arrayFill<T>(startIndex: number, num: number, value: T): T[] {
    if (startIndex > 0) {
        throw new Error("You cannot use arrayFill with startIndex>0");
    }

    let key, arr = [];

    if (!isNaN(startIndex) && !isNaN(num)) {
        for (key = 0; key < num; key++) {
            arr[(key + startIndex)] = value;
        }
    }

    return arr;
}
