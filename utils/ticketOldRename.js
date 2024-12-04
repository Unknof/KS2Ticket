const { devNameMapping } = require('./config.json');

async function renameTickets(guild) {
    const pattern = /^(\d{4})-Icon-(.+?)-(.+)$/;
    let count = 0;

    for (const channel of guild.channels.cache.values()) {
        if (channel.type !== 0) continue;
        
        const match = channel.name.match(pattern);
        if (!match) continue;

        const [_, number, potentialDev, description] = match;
        let newName;

        if (potentialDev.toLowerCase() === 'usn') {
            newName = `${description}-${number}`;
        } else if (devNameMapping[potentialDev.toLowerCase()]) {
            newName = `${devNameMapping[potentialDev.toLowerCase()]}-${description}-${number}`;
        }

        try {
            await channel.setName(newName);
            count++;
            console.log(`Renamed channel ${channel.name} to ${newName}`);
        } catch (error) {
            console.error(`Failed to rename ${channel.name}:`, error);
        }
    }

    return count;
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'reformattickets') return;
    
    if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
        return interaction.reply('You need administrator permissions to use this command.');
    }

    await interaction.reply('Starting ticket reformatting...');
    const count = await renameTickets(interaction.guild);
    await interaction.followUp(`Reformatting complete. Renamed ${count} tickets.`);
});