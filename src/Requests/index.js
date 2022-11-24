const fetch = require('node-fetch');
const Discord = require('../Errors/DiscordApi');
const DetectedStatuses = [429, 401, 403];
const DiscordError = require('../Errors/DiscordApi')

module.exports.get = async function (Uri, Options) {
    if (process.env.DEBUG == true) {
        console.info(timestamp.default(), '-----------------------------------------------------');
        console.info(timestamp.default(), `-= Get Request: "${Uri} / ${Options ? Options : "None Provided"}" =-`);
        console.info(timestamp.default(), '-----------------------------------------------------');
    };
    var headers = {};
    var Discord_Reponse = null;

    if (Options.hasOwnProperty('Authorization')) {
        headers = {
            "Authorization": Options?.Authorization
        };
    }

    await fetch(Uri, {
        headers
    })
        .then(response => {
            console.log(response.status)
            if (!(DetectedStatuses.includes(response.status)))
                return response.json ? response.json() : response.text();
            else if (DetectedStatuses.includes(response.status) && response.statusText !== 'Unauthorized') {
                return new DiscordError(`[${response.status}] You've been ratelimited.`)
            } else if (DetectedStatuses.includes(response.status) && response.statusText == 'Unauthorized') {
                return new DiscordError(`[${response.status}] Invalid token provided!`)
            } else if (response.status != 200) return new DiscordError(`[${response.status}] Couldn't identify the issue!`);
        })
        .then(final => {
            if (final?.code === 0) return new DiscordError(`Invalid Token Provided!`);
            return Discord_Reponse = final;
        })

    return new Promise(function (resolve, reject) {
        if (Discord_Reponse) {
            resolve(Discord_Reponse);
        } else if (!Discord_Reponse) {
            reject(null);
        }
    })
}

module.exports.post = async function (Uri, Options) {
    if (process.env.DEBUG == true) {
        console.info(timestamp.default(), '-----------------------------------------------------');
        console.info(timestamp.default(), `-= Post Request: "${Uri} / ${Options ? Options : "None Provided"}" =-`);
        console.info(timestamp.default(), '-----------------------------------------------------');
    };
    var headers = {
        "Content-Type": "application/json"
    }
    var Discord_Reponse = null;


    if (Options.hasOwnProperty('Authorization')) {
        Object.assign(headers, { "Authorization": Options?.Authorization });
    }

    if (!Options.hasOwnProperty('Body')) new DiscordError("Body was not provided!");
    var body = Options.Body;

    await fetch(Uri, {
        method: "post",
        body,
        headers
    })
        .then(response => {
            console.log(response.status)
            if (!(DetectedStatuses.includes(response.status)))
                return response.json ? response.json() : response.text();
            else if (DetectedStatuses.includes(response.status) && response.statusText !== 'Unauthorized') {
                return new DiscordError(`[${response.status}] You've been ratelimited.`)
            } else if (DetectedStatuses.includes(response.status) && response.statusText == 'Unauthorized') {
                return new DiscordError(`[${response.status}] Invalid token provided!`)
            } else if (response.status != 200) return new DiscordError(`[${response.status}] Couldn't identify the issue!`);
        })
        .then(final => {
            if (final?.code === 0) return new DiscordError(`Invalid Token Provided!`);
            return Discord_Reponse = final;
        })

    return new Promise(function (resolve, reject) {
        if (Discord_Reponse) {
            resolve(Discord_Reponse);
        } else if (!Discord_Reponse) {
            reject(null);
        }
    })
}

module.exports.delete = async function (Uri, Options) {
    if (process.env.DEBUG == true) {
        console.info(timestamp.default(), '-----------------------------------------------------');
        console.info(timestamp.default(), `-= Delete Request: "${Uri} / ${Options ? Options : "None Provided"}" =-`);
        console.info(timestamp.default(), '-----------------------------------------------------');
    };
    var headers = {};
    var Discord_Reponse = null;

    if (Options.hasOwnProperty('Authorization')) {
        Object.assign(headers, { "Authorization": Options?.Authorization });
    }

    if (Options.hasOwnProperty('Audit_Reason')) {
        Object.assign(headers, { "X-Audit-Log-Reason": Options.Audit_Reason });
    }

    await fetch(Uri, {
        method: "delete",
        headers
    })
        .then(response => {
            console.log(response.status)
            if (!(DetectedStatuses.includes(response.status)))
                return response.json ? response.json() : response.text();
            else if (DetectedStatuses.includes(response.status) && response.statusText !== 'Unauthorized') {
                return new DiscordError(`[${response.status}] You've been ratelimited.`)
            } else if (DetectedStatuses.includes(response.status) && response.statusText == 'Unauthorized') {
                return new DiscordError(`[${response.status}] Invalid token provided!`)
            } else if (response.status != 200) return new DiscordError(`[${response.status}] Couldn't identify the issue!`);
        })
        .then(final => {
            if (final?.code === 0) return new DiscordError(`Invalid Token Provided!`);
            return Discord_Reponse = final;
        })

    return new Promise(function (resolve, reject) {
        if (Discord_Reponse) {
            resolve(Discord_Reponse);
        } else if (!Discord_Reponse) {
            reject(null);
        }
    })
}

module.exports.patch = async function (Uri, Options) {
    if (process.env.DEBUG == true) {
        console.info(timestamp.default(), '-----------------------------------------------------');
        console.info(timestamp.default(), `-= Post Request: "${Uri} / ${Options ? Options : "None Provided"}" =-`);
        console.info(timestamp.default(), '-----------------------------------------------------');
    };
    var headers = {
        "Content-Type": "application/json"
    }
    var Discord_Reponse = null;


    if (Options.hasOwnProperty('Authorization')) {
        Object.assign(headers, { "Authorization": Options?.Authorization });
    }

    if (!Options.hasOwnProperty('Body')) new DiscordError("Body was not provided!");
    var body = Options.Body;

    await fetch(Uri, {
        method: "post",
        body,
        headers
    })
        .then(response => {
            console.log(response.status)
            if (!(DetectedStatuses.includes(response.status)))
                return response.json ? response.json() : response.text();
            else if (DetectedStatuses.includes(response.status) && response.statusText !== 'Unauthorized') {
                return new DiscordError(`[${response.status}] You've been ratelimited.`)
            } else if (DetectedStatuses.includes(response.status) && response.statusText == 'Unauthorized') {
                return new DiscordError(`[${response.status}] Invalid token provided!`)
            } else if (response.status != 200) return new DiscordError(`[${response.status}] Couldn't identify the issue!`);
        })
        .then(final => {
            if (final?.code === 0) return new DiscordError(`Invalid Token Provided!`);
            return Discord_Reponse = final;
        })

    return new Promise(function (resolve, reject) {
        if (Discord_Reponse) {
            resolve(Discord_Reponse);
        } else if (!Discord_Reponse) {
            reject(null);
        }
    })
}