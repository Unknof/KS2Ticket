const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { registerEvents } = require('./events');
const config = require('./config/config.json');
const { isTicketChannel } = require('./utils/ticketUtils');
const { checkTicketAge } = require('./utils/ticketChecks');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

setInterval(async () => {
    const guilds = client.guilds.cache;
    for (const [, guild] of guilds) {
        const channels = await guild.channels.fetch();
        for (const [, channel] of channels) {
            if (isTicketChannel(channel.name)) {
                const status = await checkTicketAge(channel);
                if (status) {
                    const prefix = status === 'red' ? '🔴' : '🟠';
                    if (!channel.name.startsWith(prefix)) {
                        await channel.setName(`${prefix}${channel.name}`);
                    }
                }
            }
        }
    }
}, 24 * 60 * 60 * 1000); // Check once per day

// Register all events
registerEvents(client);

client.login(config.token);