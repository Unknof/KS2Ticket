const fs = require('fs');
const path = require('path');

let ticketCounter = 0;
const counterPath = path.join(__dirname, '../data/ticketCounter.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Load counter
try {
    if (fs.existsSync(counterPath)) {
        const counterData = fs.readFileSync(counterPath, 'utf8');
        ticketCounter = JSON.parse(counterData).counter;
    }
} catch (err) {
    console.log('No existing ticket counter found, starting from 0');
}

function saveCounter() {
    fs.writeFileSync(counterPath, JSON.stringify({ counter: ticketCounter }, null, 2));
}

async function getNextTicketNumber() {
    ticketCounter++;
    saveCounter();
    return ticketCounter.toString().padStart(4, '0');
}

module.exports = {
    getNextTicketNumber
};