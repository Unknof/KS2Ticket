// commands/index.js
const ticketOpen = require('./ticketOpen');
const ticketClose = require('./ticketClose');
const ticketStats = require('./ticketStats');
const { addUser, removeUser } = require('./userManagement');

module.exports = {
    ticketOpen,
    ticketClose,
    ticketStats,
    addUser,
    removeUser
};