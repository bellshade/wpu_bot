const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const data = require('../data/sticker.json');
const MAHASISWA_ID = process.env.ROLES_MAHASISWA;

exports.command = new SlashCommandBuilder()
    .setName('sticker-list')
    .setDescription('View all available sticker!');

exports.permissions = [
    {
        id: MAHASISWA_ID,
        type: 'ROLE',
        permission: true
    }
];

exports.execute = async (interaction) => {
    try {
        await interaction.deferReply();

        const keys = Object.keys(data);
        const commandList = keys.map(x => `\`${x}\`\n`);

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle(`Sticker Command List`)
            .addFields(
                {
                    name: 'Available Commands',
                    value: `${commandList.join('')}`,
                    inline: false,
                }
            )
            .setTimestamp();

        await interaction.editReply({embeds: [embed]});

    } catch (error) {
        console.error(error);
    }
};
