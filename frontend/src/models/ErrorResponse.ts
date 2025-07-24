export class ErrorResponse {
    code: string;
    message: string;

    constructor(code: string, message: string) {
        this.code = code;
        this.message = message;
    }

    static fromJSON(json: any): ErrorResponse {
        return new ErrorResponse(json.code, json.message);
    }

    toJSON(): any {
        return {
            code: this.code,
            message: this.message
        };
    }
}