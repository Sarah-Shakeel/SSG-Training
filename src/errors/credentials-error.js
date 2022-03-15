module.exports = class CredentialsError {

    constructor(e = null) {
        this.originalError = e;
    }

    getOriginalError() {
        return this.originalError;
    }
};