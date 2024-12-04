const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { createTicketEmbed } = require('../utils/embeds');
const { incrementOpened } = require('../utils/statistics');
const { getNextTicketNumber } = require('../utils/counter');
const { canCreateTicket } = require('../utils/ticketChecks');
const config = require('../config/config.json');

async function ticketOpen(client, message, description) {
    // Check ticket limit
    if (!await canCreateTicket(message.member)) {
        return message.reply(`You can only have ${config.maxUserTickets} tickets open at a time.`);
    }

    if (!description) {
        return message.reply('Please provide a description for the ticket.');
    }

    try {
        const ticketNumber = await getNextTicketNumber();
        const ticketName = `${description.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}-${ticketNumber}`;

        const permissionOverwrites = [
            {
                id: message.guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: message.author.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
            },
            {
                id: client.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel, 
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ReadMessageHistory
                ],
            }
        ];

        // Add dev role permissions
        if (config.devRoles) {
            for (const roleId of config.devRoles) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel, 
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels
                    ],
                });
            }
        }

        // Add support role permissions
        if (config.supportRoles) {
            for (const roleId of config.supportRoles) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                });
            }
        }

        const channel = await message.guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            parent: config.ticketCategory,
            topic: `Ticket Creator:${message.author.id}`,
            permissionOverwrites: permissionOverwrites,
        });

        // Create and send embed
        const ticketEmbed = createTicketEmbed(ticketNumber, description, message.author);
        await channel.send({ embeds: [ticketEmbed] });

        // Add assignment reaction control
        const controlMsg = await channel.send('Ticket Controls:');
        await controlMsg.react('📌'); // Assignment pin
        await controlMsg.react('📍'); // Unassignment pin

        // Update statistics
        incrementOpened(message.author.id);

        // Send log message
        if (config.logChannel) {
            const logChannel = await client.channels.fetch(config.logChannel);
            await logChannel.send({
                embeds: [
                    ticketEmbed
                        .setTitle(`Ticket #${ticketNumber} Created`)
                        .setDescription(`A new ticket has been created: ${channel}`)
                ]
            });
        }

        return message.reply(`Ticket created in ${channel}`);
    } catch (error) {
        console.error('Error creating ticket:', error);
        return message.reply('An error occurred while creating the ticket.');
    }
}

module.exports = ticketOpen;