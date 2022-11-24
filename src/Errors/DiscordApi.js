class Discord extends Error {
    constructor(message) {
        super(message);
        this.name = "[Discord]"
    }
}

module.exports = Discord;