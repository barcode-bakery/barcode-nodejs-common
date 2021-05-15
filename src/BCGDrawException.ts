'use strict';

class BCGDrawException extends Error {
    /**
     * Constructor with error message.
     *
     * @param message The message.
     */
    constructor(message?: string) {
        super(message);
    }
}

export { BCGDrawException }
