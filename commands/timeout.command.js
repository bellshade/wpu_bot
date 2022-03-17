const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { interactionCheckPermission } = require('../modules/utility');

const KETUA_KELAS_ID = process.env.ROLE_KETUA;

const timeCalc = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
};

exports.command = new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Extended timeout command')
    .setDefaultPermission('false')
    .addUserOption((option) => option
        .setName('target')
        .setDescription('Select a user')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('durations')
        .setDescription('1s, 1m, 1h, 1d max 26d')
        .setRequired(true)
        .addChoice('1 hour', '1h')
        .addChoice('1 Day', '1d')
        .addChoice('Max', '26d')
    )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('Reason for timeout')
    )
    ;

exports.permissions = [
    {
        id:  KETUA_KELAS_ID,
        type: 'ROLE',
        permisssion: true
    }
];

exports.execute = async (interaction) => {
    try {
        await interaction.deferReply();

        const target = interaction.options.getUser('target');
        const member = await interaction.guild.members.fetch(target);
        const durations = interaction.options.getString('durations');
        const reason = interaction.options.getString('reason') || '';

        const timeType = durations.slice(-1);

        // Check format waktu apakah sudah sesuai
        if (!['s', 'm', 'h', 'd'].includes()) {
            await interaction.editReply({ content: 'Incorrect Duration Format', ephemeral: true });
            return;
        }

        const duration = parseInt(durations.slice(0, -1)) || 0;
        const durationMs = Math.floor(duration * (timeCalc[timeType] || 1) * 1000); // Covert duration to miliseconds

        // check apakah durasi melebihi batas maksimum
        if (durationMs >= 2419200000) {
            await interaction.editReply({ content: 'Maximal timeout is 27d', ephemeral: true });
            return;
        }

        if (!await interactionCheckPermission(interaction, member)) return;

        const timeoutEmbed = new MessageEmbed()
            .setColor('#992d22')
            .setDescription(`<@${target}> has been timeout`);

        await member.timeout(durationMs, reason);
        await interaction.editReply({ embeds: [timeoutEmbed] });
    } catch (error) {
        console.error(error);
    }
};
