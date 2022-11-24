module.exports = (data) => {
    names = []
    intents = 0

    data.map(intent => {
        if (names.includes(intent.name)) {
            global._Error("You cannot put the same intent more then 1 time")
        } else {
            if (intent.name == 'all') {
                intents = intent.value
            } else {
                names.push(intent.name)
                intents += intent.value
            }
        }

        return intents;
    })

    return intents
}