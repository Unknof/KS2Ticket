const { EmbedBuilder } = require('discord.js');

function createTicketEmbed(ticketNumber, description, author) {
    return new EmbedBuilder()
        .setTitle(`Ticket #${ticketNumber}`)
        .setDescription(description)
        .setColor('#00ff00')
        .addFields(
            { name: 'Available Commands', value: 
                '`-ticket close [reason]` - Close this ticket with an optional reason\n' +
                '`-ticket adduser @user` - Add a user to this ticket\n' +
                '`-ticket removeuser @user` - Remove a user from this ticket\n' +
                '`-ticketping` - Ping the ticket creator'
            }
        )
        .setTimestamp();
}

function createCloseEmbed(channelName, closedBy, reason) {
    return new EmbedBuilder()
        .setTitle('Ticket Closed')
        .setDescription(`Ticket ${channelName} has been closed`)
        .addFields(
            { name: 'Closed by', value: closedBy },
            { name: 'Reason', value: reason || 'No reason provided' }
        )
        .setColor('#ff0000')
        .setTimestamp();
}

function createLogEmbed(title, description, fields = [], color = '#0099ff') {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .addFields(fields)
        .setColor(color)
        .setTimestamp();
}

module.exports = {
    createTicketEmbed,
    createCloseEmbed,
    createLogEmbed
};