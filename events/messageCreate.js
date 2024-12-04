const config = require('../config/config.json');
const commands = require('../commands');
const { isTicketChannel } = require('../utils/ticketUtils');

async function messageCreate(client, message) {
    if (message.author.bot) return;

    if (message.content.startsWith('-ticketping') && isTicketChannel(message.channel.name)) {
        const ticketCreatorId = message.channel.topic?.split(':')[1];
        if (ticketCreatorId) {
            message.channel.send(`<@${ticketCreatorId}>`);
        }
        return;
    }

    if (!message.content.startsWith(config.prefix)) return;
    
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ticket') {
        const subCommand = args.shift()?.toLowerCase();

        // Check if non-dev user is creating ticket in wrong channel
        if (subCommand === 'open') {
            const isDev = message.member.roles.cache.some(role => 
                config.devRoles.includes(role.id)
            );

            if (!isDev && message.channel.id !== config.ticketCreateChannelId) {
                message.reply('Non-dev members can only create tickets in the designated channel.');
                return;
            }
        }
       
        switch (subCommand) {
            case 'open':
                await commands.ticketOpen(client, message, args.join(' '));
                break;
            case 'close':
                await commands.ticketClose(client, message, args.join(' '));
                break;
            case 'adduser':
                await commands.addUser(client, message, args);
                break;
            case 'removeuser':
                await commands.removeUser(client, message, args);
                break;
            case 'stats':
                await commands.ticketStats(client, message);
                break;
            default:
                message.reply('Invalid ticket command. Use `ticket open`, `ticket close`, `ticket adduser`, `ticket removeuser`, or `ticket stats`.');
        }
    }
}

module.exports = messageCreate;