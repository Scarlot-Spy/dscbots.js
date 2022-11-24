module.exports = {
    FLAGS: {
        GUILDS: { name: "guilds", value: 1 << 0 },
        GUILD_MEMBERS: { name: "guild_members", value: 1 << 1 },
        GUILD_BANS: { name: "guild_bans", value: 1 << 2 },
        GUILD_EMOJIS_AND_STICKERS: { name: "guild_emojis_and_stickers", value: 1 << 3 },
        GUILD_INTEGRATIONS: { name: "guild_integrations", value: 1 << 4 },
        GUILD_WEBHOOKS: { name: "guild_webhooks", value: 1 << 5 },
        GUILD_INVITES: { name: "guild_invites", value: 1 << 6 },
        GUILD_VOICE_STATES: { name: "guild_voice_states", value: 1 << 7 },
        GUILD_PRESENCES: { name: "guild_presences", value: 1 << 8 },
        GUILD_MESSAGES: { name: "guild_messages", value: 1 << 9 },
        GUILD_MESSAGE_REACTIONS: { name: "guild_message_reactions", value: 1 << 10 },
        GUILD_MESSAGE_TYPING: { name: "guild_message_typing", value: 1 << 11 },
        DIRECT_MESSAGES: { name: "direct_messages", value: 1 << 12 },
        DIRECT_MESSAGE_REACTIONS: { name: "direct_message_reactions", value: 1 << 13 },
        DIRECT_MESSAGE_TYPING: { name: "direct_message_typing", value: 1 << 14 },
        MESSAGE_CONTENT: { name: "message_content", value: 1 << 15 },
        GUILD_SCHEDULED_EVENTS: { name: "child_scheduled_events", value: 1 << 16},
        AUTO_MODERATION_CONFIGURATION: { name: "auto_generation_configuration", value: 1 << 20},
        AUTO_MODERATION_EXECUTION: { name: "auto_generation_execution", value: 1 << 21},
        ALL: { name: "all", value: 32767 }
    }
}