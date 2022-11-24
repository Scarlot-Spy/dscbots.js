class DscbotsError extends Error {
    constructor(message) {
        super(message);
        this.name = "[Dscbots.js]"
    }
}

module.exports = DscbotsError;