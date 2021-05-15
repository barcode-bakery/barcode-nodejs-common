'use strict';

class BCGArgumentException extends Error {
    /**
     * Constructor with specific message for a parameter.
     *
     * @param message The message.
     * @param param The param.
     */
    constructor(message?: string, public param?: string) {
        super(message);
    }
}

export { BCGArgumentException }
