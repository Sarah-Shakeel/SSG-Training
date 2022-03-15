const _ = require('lodash');
const BusinessError = require("../business-error");
const CredentialsError = require('../credentials-error');
const ErrorTypes = require("../error-types");
const PaymentError = require('../../../payment-processor/errors/payment-error');


module.exports = class HttpErrorResponseHandler {

    static handle(resp) {
        return (error) => {
            new HttpErrorResponseHandler(resp).handleError(error);
        }
    }

    constructor(resp) {
        this.resp = resp;
        this.responseFormat = {
            status: "",
            data: {},
            message: "",
            errors: [],
        };
    }

    handleError(error) {

        if (error instanceof BusinessError) {
            this.handleBusinessError(error);
        } else if (error instanceof CredentialsError) {
            this.handleCredentialsError(error);
        } else if (error) {
            this.handleApplicationError(error);
        }
    }

    handleBusinessError(error) {

        switch (error.type) {
            case ErrorTypes.NOT_FOUND:
                this.responseFormat.status = 404;
                break;
            case ErrorTypes.FORBIDDEN:
                this.responseFormat.status = 403;
                break;
            case ErrorTypes.DUPLICATE_DATA:
                this.responseFormat.status = 400;
                break;
            case ErrorTypes.MISSING_DATA:
                this.responseFormat.status = 400;
                break;
            case ErrorTypes.MISSING_ATTRIBUTES:
                this.responseFormat.status = 400;
                break;
            default:
                this.responseFormat.status = 400;
        }
        console.error("Business Error", error.errorLocation, new Date(), error);
        this.responseFormat.errors = error.extraInfo;
        this.responseDataFillUp(this.responseFormat.status, {}, error.message);
        this.resp.status(this.responseFormat.status).json(this.responseFormat);
    }

    handleApplicationError(error) {
        console.error("Application Error", new Date(), error);
        this.responseDataFillUp(500, {}, "Server error occurred");
        this.resp.status(500).json(this.responseFormat);
    }

    responseDataFillUp(status, data, message = "") {
        this.responseFormat.status = status;
        this.responseFormat.data = data;
        this.responseFormat.message = message;
    }

    handleCredentialsError(error) {
        console.log("Credentials error occurred due to", error.getOriginalError());
        this.resp.status(401).send({status: 401, message: "Invalid credentials"});
    }
};
