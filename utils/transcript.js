async function generateTranscript(channel) {
    const messages = await channel.messages.fetch();
    let transcript = '=== Ticket Transcript ===\n\n';
    let attachments = [];
    
    messages.reverse().forEach(msg => {
        transcript += `${msg.author.tag} (${msg.createdAt.toLocaleString()}): ${msg.content}\n`;
        
        // Add embeds
        msg.embeds.forEach(embed => {
            transcript += `[Embed: ${embed.title || 'Untitled'}]\n`;
        });

        // Collect attachments
        msg.attachments.forEach(attachment => {
            transcript += `[Attachment: ${attachment.name} (${attachment.url})]\n`;
            attachments.push({
                name: attachment.name,
                url: attachment.url
            });
        });

        transcript += '\n';
    });

    return { transcript, attachments };
}

module.exports = {
    generateTranscript
};