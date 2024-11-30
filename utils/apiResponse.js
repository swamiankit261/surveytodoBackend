class ApiResponse {
    constructor(statusCode, data, message = "success") {
        this.status = statusCode;
        this.data = data;
        this.message = message;
        this.timestamp = new Date().toISOString();
        this.success = statusCode < 400;
    }
};

export { ApiResponse };