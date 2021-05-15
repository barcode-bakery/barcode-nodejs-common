'use strict';

class BCGParseException extends Error {
    /**
     * Constructor with specific message for a barcode.
     *
     * @param barcode The barcode.
     * @param message The message.
     */
    constructor(public barcode: string, message: string) {
        super(message);
    }
}

export { BCGParseException }
