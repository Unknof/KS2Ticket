function isTicketChannel(channelName) {
    // Look for a 4-digit number at the end of the channel name
    const match = channelName.match(/-(\d{4})$/);
    return match !== null;
}

function getTicketId(channelName) {
    const match = channelName.match(/-(\d{4})$/);
    return match ? match[1] : null;
}

module.exports = {
    isTicketChannel,
    getTicketId
};