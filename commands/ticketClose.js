const { createCloseEmbed } = require('../utils/embeds');
const { incrementClosed } = require('../utils/statistics');
const { generateTranscript } = require('../utils/transcript');
const config = require('../config/config.json');

async function handleTicketClose(client, message, reason) {
    try {
        // Generate transcript
        const { transcript, attachments } = await generateTranscript(message.channel);

        // Get ticket creator ID from channel topic
        const ticketCreatorId = message.channel.topic?.split(':')[1];
        
        // Update statistics
        incrementClosed(message.author.id);

        // Send transcript and attachments
        if (config.transcriptChannel) {
            const transcriptChannel = await client.channels.fetch(config.transcriptChannel);
            
            // Create base files array with transcript
            const files = [{
                attachment: Buffer.from(transcript, 'utf8'),
                name: `${message.channel.name}-transcript.txt`
            }];

            // Add all attachments from messages
            const messages = await message.channel.messages.fetch();
            for (const msg of messages.values()) {
                for (const attachment of msg.attachments.values()) {
                    files.push({
                        attachment: attachment.url,
                        name: attachment.name
                    });
                }
            }

            // Send transcript with all attachments
            await transcriptChannel.send({
                content: `Ticket Transcript: ${message.channel.name}`,
                files: files
            });
        }

        // Create closure embed for log channel
        const closeEmbed = createCloseEmbed(message.channel.name, message.author.tag, reason);

        // Send log message
        if (config.logChannel) {
            const logChannel = await client.channels.fetch(config.logChannel);
            await logChannel.send({ embeds: [closeEmbed] });
        }

        // Send DM to ticket creator if they're still in the server
        if (ticketCreatorId) {
            try {
                const creator = await message.guild.members.fetch(ticketCreatorId);
                await creator.send({ embeds: [closeEmbed] });
            } catch (error) {
                console.log('Could not send DM to ticket creator - they may have left the server or have DMs disabled');
            }
        }

        // Delete the ticket channel
        await message.channel.delete();
    } catch (error) {
        console.error('Error closing ticket:', error);
        return message.reply('An error occurred while closing the ticket.');
    }
}

module.exports = handleTicketClose;