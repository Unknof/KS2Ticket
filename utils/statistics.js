const fs = require('fs');
const path = require('path');

let statistics = {
    openedTickets: {},
    closedTickets: {},
};

// Load statistics
try {
    const statsPath = path.join(__dirname, '../data/statistics.json');
    if (fs.existsSync(statsPath)) {
        const statsData = fs.readFileSync(statsPath, 'utf8');
        statistics = JSON.parse(statsData);
    }
} catch (err) {
    console.log('No existing statistics found, starting fresh');
}

function saveStatistics() {
    const statsPath = path.join(__dirname, '../data/statistics.json');
    fs.writeFileSync(statsPath, JSON.stringify(statistics, null, 2));
}

function incrementOpened(userId) {
    statistics.openedTickets[userId] = (statistics.openedTickets[userId] || 0) + 1;
    saveStatistics();
}

function incrementClosed(userId) {
    statistics.closedTickets[userId] = (statistics.closedTickets[userId] || 0) + 1;
    saveStatistics();
}

function getStatistics() {
    return statistics;
}

module.exports = {
    incrementOpened,
    incrementClosed,
    getStatistics
};