# Discord Ticket Management Bot Setup Guide
- DO NOT UPLOAD THE config.json FILE
## Requirements
- Node.js v16.9.0 or higher
- NPM (comes with Node.js)

## Installation
```bash
# Install dependencies
npm install discord.js @discordjs/rest @discordjs/builders
```

## Project Structure
```
KS2TICKET/
├── commands/
├── config/
│   └── config.json
├── data/
│   ├── statistics.json
│   └── ticketCounter.json
├── events/
│   ├── index.js
│   ├── messageCreate.js
│   ├── messageReactionAdd.js
│   └── ready.js
├── utils/
│   ├── counter.js
│   ├── embeds.js
│   ├── statistics.js
│   ├── ticketChecks.js
│   ├── ticketOldRename.js
│   ├── ticketUtils.js
│   └── transcript.js
├── index.js
└── package.json
```

## Running the Bot
```bash
node index.js
```

## Available Commands
- `/reformattickets` - Reformats existing tickets to new naming convention (Admin only)

## Troubleshooting
- Check bot has "Manage Channels" permission
- Verify command registration in Discord
- Check console for error messages

Ticket Core Functions


ticketOpen.js - Creating tickets
ticketClose.js - Closing tickets
ticketStats.js - Tracking statistics


Event Handlers


messageCreate.js - Message processing
messageReactionAdd.js - Reaction handling
ready.js - Bot startup


Utilities


ticketChecks.js - Validation
ticketOldRename.js - Rename old tickets
embeds.js - Discord message formatting
transcript.js - Logging