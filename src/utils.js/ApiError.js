class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong") {
        super(message);
        this.name = "ApiError"; // Add this
        this.statusCode = statusCode;
        this.success = false;

        // Maintains proper stack trace (especially useful in Node.js)
        Error.captureStackTrace(this, this.constructor);
    }
}

export { ApiError };
