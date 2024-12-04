const { EmbedBuilder } = require('discord.js');
const { getStatistics } = require('../utils/statistics');

async function ticketStats(client, message) {
    try {
        const stats = getStatistics();
        const embed = new EmbedBuilder()
            .setTitle('Ticket Statistics')
            .setColor('#0099ff')
            .setTimestamp();

        // Get top 5 ticket creators
        const topCreators = Object.entries(stats.openedTickets)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        // Get top 5 ticket closers
        const topClosers = Object.entries(stats.closedTickets)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        let creatorsField = '';
        for (const [userId, count] of topCreators) {
            try {
                const user = await client.users.fetch(userId);
                creatorsField += `${user.tag}: ${count} tickets\n`;
            } catch (error) {
                creatorsField += `Unknown User: ${count} tickets\n`;
            }
        }

        let closersField = '';
        for (const [userId, count] of topClosers) {
            try {
                const user = await client.users.fetch(userId);
                closersField += `${user.tag}: ${count} tickets\n`;
            } catch (error) {
                closersField += `Unknown User: ${count} tickets\n`;
            }
        }

        embed.addFields(
            { name: 'Top Ticket Creators', value: creatorsField || 'No data' },
            { name: 'Top Ticket Closers', value: closersField || 'No data' }
        );

        return message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error getting statistics:', error);
        return message.reply('An error occurred while fetching statistics.');
    }
}

module.exports = ticketStats;