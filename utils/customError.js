class CustomError extends Error {
    constructor(code = 'GENERIC', message = 'Something went wrong', ...params) {
        super(...params)
    
        this.code = code
        this.message = message
    }
}

module.exports = CustomError;