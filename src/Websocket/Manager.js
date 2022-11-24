const WebSocket = require('ws');
const api = require(`mapih`);
const platfrom = require("os").platform();
const gateway_url = 'wss://gateway.discord.gg/?v=10&encoding=json';
const timestamp = api.Utils.Timestamp;
const Requests = require('../Requests/index');
const DiscordError = require('../Errors/DiscordApi')
const DscbotsError = require('../Errors/Error.js')

module.exports = function (client) {
    var botData = {
        presence: {},
        status: "Online",
        FirstPing: null
    };
    var session = {
        seq: null,
        resuming: false,
        heartbeatACK: false
    };
    var { RESUMEABLE, activities_id, activities_name, Formats } = require('./Enum')

    ClientStart(gateway_url, false);
    function ClientStart(GURI, reconnection) {
        const socketEmitter = new WebSocket(GURI);

        socketEmitter.on('error', (e) => {
            new DiscordError(e.stack.toString())
        });

        socketEmitter.on('open', async () => {
            if (process.env.DEBUG == "true") {
                console.info(timestamp.default(), '-----------------------------------------------------');
                console.info(timestamp.default(), `-= Gateway: "Open" =-`);
                console.info(timestamp.default(), '-----------------------------------------------------');
            };
        });

        socketEmitter.on('message', async (data_) => {
            const data = JSON.parse(data_);
            const payloadData = data.d;
            if (data.s != undefined) session.seq = data.s;

            const data_t = {
                "READY": async () => {
                    session.application_id = payloadData.application.id;
                    session.session_id = payloadData.session_id;
                    session.resume_session_id = session.session_id;
                    session.resume_gateway_url = payloadData.resume_gateway_url + `/?v=10&encoding=json`;
                    session.hb = setInterval(() => {
                        if (session.heartbeatACK) {
                            if (process.env.DEBUG == "true")
                                console.info(timestamp.default(), 'Heartbeat');
                            session.heartbeatACK = false;
                            socketEmitter.send(JSON.stringify({ "op": 1, "d": session.seq }));
                        } else socketEmitter.close(1002);
                    }, session.heartbeat_interval);

                    if (process.env.DEBUG == "true") {
                        console.info(
                            'session ID:', payloadData.session_id, 'Application ID:', payloadData.application.id,
                            '\nUser ID:', payloadData.user.id, 'Logged in as:', payloadData.user.username + '#' + payloadData.user.discriminator,
                            '\nGuilds:', payloadData.guilds.length
                        );
                        console.info(timestamp.default(), '-----------------------------------------------------');
                        console.info(timestamp.default(), 'Session created, Service Ready.\n');
                    }
                    // Return Data \\
                    client.user = payloadData.user;
                    client.username = payloadData.user.username;
                    client.id = payloadData.user.id;
                    client.avatar = payloadData.user.avatar;
                    client.user.tag = payloadData.user.username + '#' + payloadData.user.discriminator;
                    client.user.AvatarURL = function (Avataroptions = {}) {
                        const format = Avataroptions?.format;
                        if (format) {
                            if (typeof format != 'string') return new DscbotsError("Image format must be an string.");
                            if (!Formats[format]) return new DscbotsError("Invalid image format!");

                            return `https://cdn.discordapp.com/avatars/${payloadData.user.id}/${payloadData.user.avatar}.${Formats[format]}`
                        } else {
                            return `https://cdn.discordapp.com/avatars/${payloadData.user.id}/${payloadData.user.avatar}`
                        }
                    }
                    /**
                     * 
                     * @param {String|Number} code - Type of status. 
                     */
                    client.user.setStatus = function (code) {
                        var codeTypes = [0, 1, 2]
                        if (!codeTypes.includes(code) && typeof (code) != 'string') new DscbotsError("Invalid status code!");
                        var codeNames = ['online', 'dnd', 'idle']
                        var Crstatus = codeNames[code] ? codeNames[code] : code;
                        if (!codeNames.includes(Crstatus)) new DscbotsError("Invalid status code found!");
                        status = Crstatus;

                        setTimeout(function () {
                            data_op[3]()
                        }, 1500)
                    }

                    client.user.guilds = Requests.get('https://discord.com/api/v10/users/@me/guilds', {
                        Authorization: `Bot ${client.Token}`
                    })
                        .then(DiscordResponse => DiscordResponse);

                    if (client.user.guilds.length != 0) {
                        client.user.guilds.size = client.user.guilds.length
                    } else if (client.user.guilds.length == 0) {
                        client.user.guilds.size = 0
                    }

                    /**
                     * 
                     * @param {String} message - The message it will display on the status.
                     * @param {String|Number} type - The type of status it will display.
                     */
                    client.user.setActivity = function (message, type) {
                        if (!message || typeof (message) != 'string') return new DscbotsError("The message must be a string!");
                        if (!type || typeof (type) != 'string') return new DscbotsError("The status must be a string");
                        //console.log(activities_name[type])
                        if (typeof (activities_name[type]) != 'number') new DscbotsError("The activity type is invalid!")
                        presence = {
                            name: message,
                            type: activities_name[type]
                        }
                        setTimeout(function () {
                            data_op[3]()
                        }, 1000)
                    }

                    if (reconnect != true || reconnect == false) {
                        client.websocket.ping = 0;
                        client.readyCB ? client.readyCB() : null;
                    }
                },
                "MESSAGE_CREATE": async () => {
                    const message = {};
                    message.id = payloadData.id
                    message.content = payloadData.content;
                    message.author = {};
                    message.author.username = payloadData.author.username;
                    message.author.id = payloadData.author.id;
                    message.author.discriminator = payloadData.author.discriminator;
                    message.author.tag = payloadData.author.username + "#" + payloadData.author.discriminator;
                    message.author.isBot = payloadData.author.bot ? payloadData.author.bot : false;
                    message.channel = Requests.get(`https://discord.com/api/v10/channels/${payloadData.channel_id}`, {
                        Authorization: `Bot ${client.Token}`
                    })
                        .then(DiscordResponse => DiscordResponse);

                    /**
                     * 
                     * @param {String} Reason - The audit log reason for deleting. 
                     */
                    message.channel.delete = async function (Reason) {
                        Requests.delete(`https://discord.com/api/v10/channels/${payloadData.channel_id}`, {
                            Authorization: `Bot ${client.Token}`,
                            Audit_Reason: Reason ? Reason : null
                        })
                            .then(DiscordResponse => DiscordResponse);
                    }

                    ////////////////////////////////// functions //////////////////////////////////
                    message.author.AvatarURL = function (Avataroptions = {}) {
                        const format = Avataroptions?.format;
                        if (format) {
                            if (typeof format != 'string') return new DscbotsError("Image format must be an string.");
                            if (!Formats[format]) return new DiscordError("Invalid image format!");

                            return `https://cdn.discordapp.com/avatars/${payloadData.author.id}/${payloadData.author.avatar}.${Formats[format]}`
                        } else {
                            return `https://cdn.discordapp.com/avatars/${payloadData.author.id}/${payloadData.author.avatar}`
                        }
                    }

                    message.channel.send = async function (MessageContent, Data) {
                        if (!MessageContent && !Data) return new DscbotsError("Content must be provided when sending an message.");
                        if (typeof MessageContent === 'object') {
                            if (!Data) {
                                Data = MessageContent;
                            } else if (Data) return new DscbotsError("You cannot have Data!")
                        } if (typeof MessageContent === "string" && !Data) {
                            if (MessageContent == '') return new DscbotsError("Content must be provided!");
                        } else if (typeof MessageContent != 'string' && typeof Content != 'object') return new DscbotsError("Unknown content type.");
                        var embeds = [];
                        var components = [];

                        const MessageBody = { type: 4, data: {} };

                        if (typeof MessageContent === 'string') {
                            MessageBody.ephemeral = false
                            MessageBody.content = MessageContent.toString()

                            Data?.buttons?.forEach(function (button) {
                                components.push(button.getJSON());
                            })

                            Data?.menus?.forEach(function (menu) {
                                components.push(menu.getJSON());
                            })

                            Data?.embeds?.forEach(function (embed) {
                                embeds.push(embed.getJSON());
                            })

                            MessageBody.embeds = embeds;
                            if (components.length > 0) {
                                MessageBody.components = [
                                    {
                                        type: 1,
                                        components: components
                                    }
                                ]
                            }
                        } else if (typeof MessageContent === 'object') {
                            MessageContent?.buttons?.forEach(function (button) {
                                components.push(button.getJSON());
                            })

                            MessageContent?.menus?.forEach(function (menu) {
                                components.push(menu.getJSON());
                            })

                            MessageContent?.embeds?.forEach(function (embed) {
                                embeds.push(embed.getJSON());
                            })

                            MessageBody.embeds = embeds;
                            if (components.length > 0) {
                                MessageBody.components = [
                                    {
                                        type: 1,
                                        components: components
                                    }
                                ]
                            }
                        }

                        Requests.post(`https://discord.com/api/v10/channels/${payloadData.channel_id}/messages`, {
                            Authorization: `Bot ${client.Token}`,
                            Body: JSON.stringify(MessageBody)
                        })
                            .then(r => {
                                if (r?.code === 50035) {
                                    new DiscordError(JSON.stringify(r?.errors))
                                }
                            })
                    };

                    message.reply = async function (MessageContent, Data) {
                        if (!MessageContent && !Data) return new DscbotsError("Content must be provided when sending an message.");
                        if (typeof MessageContent === 'object') {
                            if (!Data) {
                                Data = MessageContent;
                            } else if (Data) return new DscbotsError("You cannot have Data!")
                        } if (typeof MessageContent === "string" && !Data) {
                            if (MessageContent == '') return new DscbotsError("Content must be provided!");
                        } else if (typeof MessageContent != 'string' && typeof Content != 'object') return new DscbotsError("Unknown content type.");
                        var embeds = [];
                        var components = [];

                        const MessageBody = { type: 4, data: {} };

                        if (typeof MessageContent === 'string') {
                            MessageBody.ephemeral = false
                            MessageBody.content = MessageContent.toString()

                            Data?.buttons?.forEach(function (button) {
                                components.push(button.getJSON());
                            })

                            Data?.menus?.forEach(function (menu) {
                                components.push(menu.getJSON());
                            })

                            Data?.embeds?.forEach(function (embed) {
                                embeds.push(embed.getJSON());
                            })

                            MessageBody.embeds = embeds;
                            if (components.length > 0) {
                                MessageBody.components = [
                                    {
                                        type: 1,
                                        components: components
                                    }
                                ]
                            }
                        } else if (typeof MessageContent === 'object') {
                            MessageContent?.buttons?.forEach(function (button) {
                                components.push(button.getJSON());
                            })

                            MessageContent?.menus?.forEach(function (menu) {
                                components.push(menu.getJSON());
                            })

                            MessageContent?.embeds?.forEach(function (embed) {
                                embeds.push(embed.getJSON());
                            })

                            MessageBody.embeds = embeds;
                            if (components.length > 0) {
                                MessageBody.components = [
                                    {
                                        type: 1,
                                        components: components
                                    }
                                ]
                            }
                        }

                        Requests.post(`https://discord.com/api/v10/channels/${payloadData.channel_id}/messages`, {
                            Authorization: `Bot ${client.Token}`,
                            Body: JSON.stringify(MessageBody)
                        })
                            .then(r => {
                                if (r?.code === 50035) {
                                    new DiscordError(JSON.stringify(r?.errors))
                                }
                            })
                    }

                    message.channel.bulkDelete = function (Amount) {
                        const Min_value = 2;
                        const Max_value = Amount ? Amount : 100

                        Requests.get(`https://discord.com/api/v10/channels/${message.channel.id}/messages`, {
                            Authorization: `Bot ${client.Token}`,
                        })
                            .then(DiscordRes => {
                                //Soon™️
                            })
                    }

                    message.edit = function (MessageContent, Data) {
                        if (payloadData.author.id === client.user.id) {
                            if (!MessageContent && !Data) return new DscbotsError("Content must be provided when sending an message.");
                            if (typeof MessageContent === 'object') {
                                if (!Data) {
                                    Data = MessageContent;
                                } else if (Data) return new DscbotsError("You cannot have Data!")
                            } if (typeof MessageContent === "string" && !Data) {
                                if (MessageContent == '') return new DscbotsError("Content must be provided!");
                            } else if (typeof MessageContent != 'string' && typeof Content != 'object') return new DscbotsError("Unknown content type.");
                            var embeds = [];
                            var components = [];

                            const MessageBody = { type: 4, data: {} };

                            if (typeof MessageContent === 'string') {
                                MessageBody.ephemeral = false
                                MessageBody.content = MessageContent.toString()

                                Data?.buttons?.forEach(function (button) {
                                    components.push(button.getJSON());
                                })

                                Data?.menus?.forEach(function (menu) {
                                    components.push(menu.getJSON());
                                })

                                Data?.embeds?.forEach(function (embed) {
                                    embeds.push(embed.getJSON());
                                })

                                MessageBody.embeds = embeds;
                                if (components.length > 0) {
                                    MessageBody.components = [
                                        {
                                            type: 1,
                                            components: components
                                        }
                                    ]
                                }
                            } else if (typeof MessageContent === 'object') {
                                MessageContent?.buttons?.forEach(function (button) {
                                    components.push(button.getJSON());
                                })

                                MessageContent?.menus?.forEach(function (menu) {
                                    components.push(menu.getJSON());
                                })

                                MessageContent?.embeds?.forEach(function (embed) {
                                    embeds.push(embed.getJSON());
                                })

                                MessageBody.embeds = embeds;
                                if (components.length > 0) {
                                    MessageBody.components = [
                                        {
                                            type: 1,
                                            components: components
                                        }
                                    ]
                                }
                            }

                            Requests.patch(`https://discord.com/api/channels/${payloadData.channel_id}/messages/${payloadData.id}`, {
                                Authorization: `Bot ${client.Token}`,
                                Body: JSON.stringify(MessageBody)
                            })
                                .then(r => {
                                    if (r?.code === 50035) {
                                        new DiscordError(JSON.stringify(r?.errors))
                                    }
                                })
                        } else return new DiscordError(`Cannot edit a message sent by someone else.`);
                    }

                    message.delete = function (Reason) {
                        Requests.delete(`https://discord.com/api/v10/channels/${payloadData.channel_id}/messages/${payloadData.id}`, {
                            Authorization: `Bot ${client.Token}`,
                            Audit_Reason: Reason ? Reason : null
                        })
                    };

                    client.emit('message', message);
                }
            }

            var data_op = [];

            data_op[0] = () => {
                try {
                    (data_t[data.t]) ? data_t[data.t]() : (async () => {
                        events.emit(`${data.t}`.toLowerCase(), payloadData);
                    })();
                } catch (e) {
                    new DiscordError(e.stack.toString())
                }
            }

            data_op[1] = async () => {
                if (process.env.DEBUG == "true")
                    console.info(timestamp.default(), 'Heartbeat Requested');
                FIRST = Date.now()
                socketEmitter.send(JSON.stringify({ "op": 1, "d": session.seq }));
            };

            data_op[7] = async () => {
                socketEmitter.close(1012);
            };

            data_op[9] = async () => {
                if (process.env.DEBUG == "true")
                    console.log('OpCode: 9 -- data.d', data.d);
                (data.d) ? socketEmitter.close(5000) : socketEmitter.close(1011);
            };

            data_op[3] = async () => {
                socketEmitter.send(JSON.stringify({
                    "op": 3,
                    "d": {
                        "activities": [presence],
                        "status": status,
                        "since": 91879201,
                        "afk": false
                    },
                }));
            }

            data_op[10] = async () => {
                if (process.env.DEBUG == "true") {
                    console.info(timestamp.default(), '-----------------------------------------------------');
                    console.info(timestamp.default(), `{-= Gateway: "Hello" =-}`);
                    console.info(timestamp.default(), '-----------------------------------------------------');
                }

                session.heartbeat_interval = payloadData.heartbeat_interval;

                session.resuming ? socketEmitter.send(JSON.stringify({ "op": 6, "d": { "token": client.Token, "session_id": session.resume_session_id, "seq": session.resume_seq } }))
                    : socketEmitter.send(JSON.stringify({
                        "op": 2,
                        "d": {
                            "token": client.Token,
                            "properties": {
                                "os": platfrom,
                                "browser": client.device,
                                "device": client.device?.replace(/Discord/g, '')
                            },
                            "shard": [0, 1],
                            "intents": client``.intents,
                        }
                    }));
            };

            data_op[11] = async () => {
                if (process.env.DEBUG == "true")
                    console.info(timestamp.default(), 'Heartbeat Acknowledged');
                session.heartbeatACK = true;
            };

            try {
                data_op[data.op]();
            } catch (e) {
                new DiscordError(e.stack.toString())
            }
        });

        socketEmitter.on('close', code => {
            clearInterval(session.hb);

            if (code == 4014) {
                new DiscordError('Disallowed intents provided!')
            } else if (code == 4013) {
                new DiscordError('Invalid intents provided!')
            } else if (code == 4008) {
                new DiscordError("You've been ratelimited...")
            } else if (code == 4011) {
                new DiscordError("The application must enable sharding!")
            }

            RESUMEABLE[code] ? (() => {
                session.resume_seq = session.seq;
                session.resuming = true;
                setTimeout(function () { sessionStart(session.resume_gateway_url, true) }, 1000);
            })() : (() => {
                session.restarting = true;
                setTimeout(function () { sessionStart(gateway_url1, true) }, 1000);
            })()
        }, { once: true });
    }
};