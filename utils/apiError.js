class Apierror extends Error {
    constructor(
        statusCode,
        message = "bed request",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.status = statusCode ?? 500;
        this.data = null;
        this.success = false;
        this.errors = errors;
        if (stack) this.stack = stack; else Error.captureStackTrace(this, this.constructor);
    }
};

export { Apierror };