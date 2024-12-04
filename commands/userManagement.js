const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/config.json');
const { isTicketChannel } = require('../utils/ticketUtils');

async function addUser(client, message, args) {
    if (!isTicketChannel(message.channel.name)) {
        return message.reply('This command can only be used in ticket channels.');
    }

    const user = message.mentions.users.first();
    if (!user) {
        return message.reply('Please mention a user to add to the ticket.');
    }

    try {
        const member = await message.guild.members.fetch(user.id);
        
        // Check if user has any support roles
        const hasSupportRole = member.roles.cache.some(role => 
            config.supportRoles.includes(role.id)
        );

        if (hasSupportRole) {
            return message.reply('This user already has access through a support role.');
        }

        await message.channel.permissionOverwrites.create(user.id, {
            ViewChannel: true,
            SendMessages: true
        });

        // Log the action
        if (config.logChannel) {
            const logChannel = await client.channels.fetch(config.logChannel);
            await logChannel.send({
                embeds: [{
                    title: 'User Added to Ticket',
                    description: `${user.tag} was added to ${message.channel}`,
                    fields: [
                        { name: 'Added by', value: message.author.tag }
                    ],
                    color: 0x00ff00,
                    timestamp: new Date()
                }]
            });
        }

        return message.reply(`Added ${user.tag} to the ticket.`);
    } catch (error) {
        console.error('Error adding user:', error);
        return message.reply('An error occurred while adding the user.');
    }
}

async function removeUser(client, message, args) {
    if (!isTicketChannel(message.channel.name)) {
        return message.reply('This command can only be used in ticket channels.');
    }

    const user = message.mentions.users.first();
    if (!user) {
        return message.reply('Please mention a user to remove from the ticket.');
    }

    try {
        const member = await message.guild.members.fetch(user.id);
        
        // Check if user has any support roles
        const hasSupportRole = member.roles.cache.some(role => 
            config.supportRoles.includes(role.id)
        );

        if (hasSupportRole) {
            return message.reply('Cannot remove users with support roles.');
        }

        // Check if user is the ticket creator
        const ticketCreatorId = message.channel.topic?.split(':')[1];
        if (user.id === ticketCreatorId) {
            return message.reply('Cannot remove the ticket creator.');
        }

        await message.channel.permissionOverwrites.delete(user.id);

        // Log the action
        if (config.logChannel) {
            const logChannel = await client.channels.fetch(config.logChannel);
            await logChannel.send({
                embeds: [{
                    title: 'User Removed from Ticket',
                    description: `${user.tag} was removed from ${message.channel}`,
                    fields: [
                        { name: 'Removed by', value: message.author.tag }
                    ],
                    color: 0xff0000,
                    timestamp: new Date()
                }]
            });
        }

        return message.reply(`Removed ${user.tag} from the ticket.`);
    } catch (error) {
        console.error('Error removing user:', error);
        return message.reply('An error occurred while removing the user.');
    }
}

module.exports = {
    addUser,
    removeUser
};