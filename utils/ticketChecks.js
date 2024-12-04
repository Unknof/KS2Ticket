const config = require('../config/config.json');

async function hasPermissionForReactions(member) {
    return member.roles.cache.some(role => 
        config.supportRoles.includes(role.id) || 
        (config.devRoles && config.devRoles.includes(role.id))
    );
}

async function getUserOpenTickets(guild, userId) {
    const tickets = [];
    const channels = await guild.channels.fetch();
    
    channels.forEach(channel => {
        if (channel.topic && channel.topic.includes(`Creator:${userId}`)) {
            tickets.push(channel);
        }
    });
    
    return tickets;
}

async function canCreateTicket(member) {
    if (await hasPermissionForReactions(member)) return true;
    
    const openTickets = await getUserOpenTickets(member.guild, member.id);
    return openTickets.length < config.maxUserTickets;
}

async function checkTicketAge(channel) {
    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    const now = Date.now();
    const threeMonths = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

    // Check channel creation date
    const channelAge = now - channel.createdTimestamp;
    if (channelAge > threeMonths) {
        // Check last activity
        const lastActivity = lastMessage ? now - lastMessage.createdTimestamp : channelAge;
        
        if (lastActivity > threeMonths) {
            return 'red'; // No activity for 3 months
        }
        return 'orange'; // Channel older than 3 months but has activity
    }
    return null;
}

module.exports = {
    hasPermissionForReactions,
    getUserOpenTickets,
    canCreateTicket,
    checkTicketAge
};