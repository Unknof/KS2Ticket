const messageCreate = require('./messageCreate');
const messageReactionAdd = require('./messageReactionAdd');
const ready = require('./ready');

function registerEvents(client) {
    client.once('ready', ready);
    client.on('messageCreate', (message) => messageCreate(client, message));
    client.on('messageReactionAdd', async (reaction, user) => {
        try {
            await messageReactionAdd(client, reaction, user);
        } catch (error) {
            console.error('Error in reaction handler:', error);
        }
    });
}

module.exports = { registerEvents };