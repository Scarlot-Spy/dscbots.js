const EventEmitter = require('events');
const Requests = require('../Requests/index');
const DscbotsError = require('../Errors/Error');
const form = require('./Functions/intents')

class Client extends EventEmitter {
    constructor(ClientOptions) {
        super();
        if (!ClientOptions.hasOwnProperty('token')) return new DscbotsError('No token provided!');
        if (!ClientOptions.hasOwnProperty('intents')) return new DscbotsError("No intents provided!");
        if (!ClientOptions.hasOwnProperty('device')) this.device = 'Chrome';

        this.Intents = ClientOptions.intents ? ClientOptions.intents : [];
        this.Token = ClientOptions.token ? ClientOptions.token : null;
        this.device = ClientOptions.device ? ClientOptions.device : 'Chrome';
        this.websocket = require('../Websocket/Manager');
    }

    Create(cb) {
        if (!this.Token) return new DscbotsError("No token provided to create bot.");
        Requests.get('https://discord.com/api/users/@me', {
            Authorization: `Bot ${this.Token}`
        })
            .then(Response => {
                if (typeof this.intents != 'number' && this.intents instanceof Array) {
                    const intents = form(this.intents)
                    this.intents = intents
                } else if (!(this.intents instanceof Array) && typeof intents == 'number') {
                    this.intents = intents;
                }
                Response.Token = this.Token
                this.readyCB = cb ? cb : null;
                
                this.websocket(this);
            })
    }
};

module.exports = Client;