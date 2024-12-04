const { isTicketChannel, getTicketId } = require('../utils/ticketUtils');
const { hasPermissionForReactions, checkTicketAge } = require('../utils/ticketChecks');
const config = require('../config/config.json');
const { EmbedBuilder } = require('discord.js');

async function messageReactionAdd(client, reaction, user) {
    // Fetch the reaction if it's partial
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }

    if (user.bot) return;
    
    const message = reaction.message;
    if (!isTicketChannel(message.channel.name)) return;

    // Remove reaction if user doesn't have permission
    const member = await message.guild.members.fetch(user.id);
    if (!await hasPermissionForReactions(member)) {
        await reaction.users.remove(user);
        return;
    }

    try {
        if (reaction.emoji.name === '📌') { // Assignment reaction
            await handleAssignment(client, message.channel, user);
        } else if (reaction.emoji.name === '📍') { // Unassign reaction
            await handleUnassignment(client, message.channel, user);
        }
        // Always remove the user's reaction after handling
        await reaction.users.remove(user);
    } catch (error) {
        console.error('Error handling reaction:', error);
        message.channel.send('An error occurred while processing the reaction.');
    }
}

async function handleAssignment(client, channel, user) {
    try {
        // Determine target category
        let targetCategoryId = config.assignedCategories?.[user.id] || config.defaultAssignedCategory;
        
        // Update channel name with assignee prefix
        const currentName = channel.name;
        const newName = `${user.username.slice(0, 3).toLowerCase()}-${currentName}`;
        
        // Move channel and update name
        await channel.setParent(targetCategoryId, { lockPermissions: false });
        await channel.setName(newName);

        // Send confirmation message
        await channel.send(`Ticket assigned to ${user.tag}`);

        // Update embed if it exists
        const messages = await channel.messages.fetch({ limit: 10 });
        const ticketEmbed = messages.find(m => m.embeds.length > 0 && m.author.id === client.user.id);
        if (ticketEmbed && ticketEmbed.embeds[0]) {
            const oldEmbed = ticketEmbed.embeds[0];
            const newEmbed = EmbedBuilder.from(oldEmbed)
                .addFields({ name: 'Assigned to', value: user.tag });
            await ticketEmbed.edit({ embeds: [newEmbed] });
        }

        // Check ticket age and update prefix if needed
        const ageStatus = await checkTicketAge(channel);
        if (ageStatus) {
            const prefix = ageStatus === 'red' ? '🔴' : '🟠';
            await channel.setName(`${prefix}${newName}`);
        }
    } catch (error) {
        console.error('Error assigning ticket:', error);
        channel.send('An error occurred while assigning the ticket.');
    }
}

async function handleUnassignment(client, channel, user) {
    try {
        // Get ticket ID from channel name
        const ticketId = getTicketId(channel.name);
        if (!ticketId) {
            throw new Error('Could not determine ticket ID');
        }

        // Get the original name parts
        let parts = channel.name.split('-');
        // The ID will always be the last part
        const id = parts[parts.length - 1];
        
        // Remove any color indicators from the first part
        if (parts[0].startsWith('🔴') || parts[0].startsWith('🟠')) {
            parts[0] = parts[0].slice(2); // Remove the emoji
        }

        // If first part is a 3-letter username, remove it
        if (parts[0].length === 3) {
            parts = parts.slice(1);
        }

        // Reconstruct the name
        let newName = parts.join('-');

        // Move back to main category
        await channel.setParent(config.ticketCategory, { lockPermissions: false });
        await channel.setName(newName);

        // Send confirmation message
        await channel.send(`Ticket unassigned by ${user.tag}`);

        // Update embed if it exists
        const messages = await channel.messages.fetch({ limit: 10 });
        const ticketEmbed = messages.find(m => m.embeds.length > 0 && m.author.id === client.user.id);
        if (ticketEmbed && ticketEmbed.embeds[0]) {
            const oldEmbed = ticketEmbed.embeds[0];
            const newEmbed = EmbedBuilder.from(oldEmbed);
            // Remove the 'Assigned to' field if it exists
            const fields = oldEmbed.fields.filter(field => field.name !== 'Assigned to');
            newEmbed.setFields(fields);
            await ticketEmbed.edit({ embeds: [newEmbed] });
        }

        // Re-check ticket age and update prefix if needed
        const ageStatus = await checkTicketAge(channel);
        if (ageStatus) {
            const prefix = ageStatus === 'red' ? '🔴' : '🟠';
            await channel.setName(`${prefix}${newName}`);
        }

        console.log(`Unassigned ticket. New name: ${newName}`); // Debug log
    } catch (error) {
        console.error('Error unassigning ticket:', error);
        channel.send('An error occurred while unassigning the ticket.');
    }
}

module.exports = messageReactionAdd;