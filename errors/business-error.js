module.exports = class BusinessError {
    constructor(type, message, extraInfo, errorLocation) {
        this.type = type;
        this.message = message;
        this.extraInfo = extraInfo;
        this.errorLocation = errorLocation;
    }
};
