const WebSocket = require('ws');
const api = require(`mapih`);
const platfrom = require("os").platform();
const fetch = require('node-fetch');
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
                    clientData.user = payloadData.user;
                    clientData.username = payloadData.user.username;
                    clientData.id = payloadData.user.id;
                    clientData.avatar = payloadData.user.avatar;
                    clientData.user.tag = payloadData.user.username + '#' + payloadData.user.discriminator;
                    clientData.user.AvatarURL = function (Avataroptions = {}) {
                        const format = Avataroptions?.format;
                        if (format) {
                            if (typeof format != 'string') return global._Error("Image format must be an string.");
                            if (!Formats[format]) return global._Error("Invalid image format!");

                            return `https://cdn.discordapp.com/avatars/${payloadData.user.id}/${payloadData.user.avatar}.${Formats[format]}`
                        } else {
                            return `https://cdn.discordapp.com/avatars/${payloadData.user.id}/${payloadData.user.avatar}`
                        }
                    }
                    /**
                     * 
                     * @param {String|Number} code - Type of status. 
                     */
                    clientData.user.setStatus = function (code) {
                        var codeTypes = [0, 1, 2]
                        if (!codeTypes.includes(code) && typeof (code) != 'string') global._Error("Invalid status code!");
                        var codeNames = ['online', 'dnd', 'idle']
                        var Crstatus = codeNames[code] ? codeNames[code] : code;
                        if (!codeNames.includes(Crstatus)) global._Error("Invalid status code found!");
                        status = Crstatus;

                        setTimeout(function () {
                            data_op[3]()
                        }, 1500)
                    }

                    clientData.user.guilds = Requests.get('https://discord.com/api/v10/users/@me/guilds', {
                        Authorization: `Bot ${client.Token}`
                    })
                        .then(DiscordResponse => DiscordResponse);

                    if (clientData.user.guilds.length != 0) {
                        clientData.user.guilds.size = clientData.user.guilds.length
                    } else if (clientData.user.guilds.length == 0) {
                        clientData.user.guilds.size = 0
                    }

                    /**
                     * 
                     * @param {String} message - The message it will display on the status.
                     * @param {String|Number} type - The type of status it will display.
                     */
                    clientData.user.setActivity = function (message, type) {
                        if (!message || typeof (message) != 'string') return global._Error("The message must be a string!");
                        if (!type || typeof (type) != 'string') return global._Error("The status must be a string");
                        //console.log(activities_name[type])
                        if (typeof (activities_name[type]) != 'number') global._Error("The activity type is invalid!")
                        presence = {
                            name: message,
                            type: activities_name[type]
                        }
                        setTimeout(function () {
                            data_op[3]()
                        }, 1000)
                    }

                    if (reconnect != true || reconnect == false) {
                        clientData.websocket.ping = 0;
                        clientData.readyCB ? clientData.readyCB() : null;
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
                            if (typeof format != 'string') return global._Error("Image format must be an string.");
                            if (!Formats[format]) return global.DiscordError("Invalid image format!");

                            return `https://cdn.discordapp.com/avatars/${payloadData.author.id}/${payloadData.author.avatar}.${Formats[format]}`
                        } else {
                            return `https://cdn.discordapp.com/avatars/${payloadData.author.id}/${payloadData.author.avatar}`
                        }
                    }

                    message.channel.send = async function (MessageContent, Data) {
                        if (!MessageContent && !Data) return global._Error("Content must be provided when sending an message.");
                        if (typeof MessageContent === 'object') {
                            if (!Data) {
                                Data = MessageContent;
                            } else if (Data) return global._Error("You cannot have Data!")
                        } if (typeof MessageContent === "string" && !Data) {
                            if (MessageContent == '') return global._Error("Content must be provided!");
                        } else if (typeof MessageContent != 'string' && typeof Content != 'object') return global._Error("Unknown content type.");
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
                        if (!MessageContent && !Data) return global._Error("Content must be provided when sending an message.");
                        if (typeof MessageContent === 'object') {
                            if (!Data) {
                                Data = MessageContent;
                            } else if (Data) return global._Error("You cannot have Data!")
                        } if (typeof MessageContent === "string" && !Data) {
                            if (MessageContent == '') return global._Error("Content must be provided!");
                        } else if (typeof MessageContent != 'string' && typeof Content != 'object') return global._Error("Unknown content type.");
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
                        if (payloadData.author.id === clientData.user.id) {
                            if (!MessageContent && !Data) return global._Error("Content must be provided when sending an message.");
                            if (typeof MessageContent === 'object') {
                                if (!Data) {
                                    Data = MessageContent;
                                } else if (Data) return global._Error("You cannot have Data!")
                            } if (typeof MessageContent === "string" && !Data) {
                                if (MessageContent == '') return global._Error("Content must be provided!");
                            } else if (typeof MessageContent != 'string' && typeof Content != 'object') return global._Error("Unknown content type.");
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

                    clientData.emit('message', message);
                }
            }
        })
    }
};