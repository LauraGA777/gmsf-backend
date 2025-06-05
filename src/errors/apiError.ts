export class ApiError extends Error {
    statusCode: number;
  
    constructor(message: string, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.name = "ApiError";
  
      // This is for better stack traces in Node.js
    Error.captureStackTrace(this, this.constructor);
  }
}
