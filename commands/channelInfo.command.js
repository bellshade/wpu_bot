const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const MAHASISWA_ID = process.env.ROLES_MAHASISWA;

exports.command = new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('View information about the given channel')
    .addChannelOption((option) =>
        option
            .setName('channel')
            .setDescription('Select a channel')
            .setRequired(true)
    );

exports.permissions = [
    {
        id: MAHASISWA_ID,
        type: 'ROLE',
        permisssion: true
    }
]

exports.execute = async (interaction) => {
    try {
        await interaction.deferReply();
        const channel = interaction.options.getChannel('channel');
        const channelInfoEmbed = new MessageEmbed()
            .setColor('#992d22')
            .setDescription(`<#${channel.id}>`)
            .addFields(
                {
                    name: 'Name',
                    value: channel.name,
                    inline: true,
                },
                {
                    name: 'Server',
                    value: channel.guild.name,
                    inline: true,
                },
                {
                    name: 'ID',
                    value: channel.id,
                    inline: true,
                },
                {
                    name: 'Category ID',
                    value: channel.parentId,
                    inline: true,
                },
                {
                    name: 'Position',
                    value: `${channel.position + 1}`,
                    inline: true,
                },
                {
                    name: 'NSFW',
                    value: `${channel.nsfw}`,
                    inline: true,
                },
                {
                    name: 'Members (cached)',
                    value: `${channel.members.size}`,
                    inline: true,
                },
                {
                    name: 'Category',
                    value: channel.parent.name,
                    inline: true,
                },
                {
                    name: 'Created at',
                    value: new Date(channel.createdTimestamp).toLocaleString(),
                    inline: true,
                }
            )
            .setTimestamp();
        await interaction.editReply({ embeds: [channelInfoEmbed] });
    } catch (error) {
        console.error(error);
    }
};
