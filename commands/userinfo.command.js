const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const MAHASISWA_ID = process.env.ROLES_MAHASISWA;

exports.command = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Views your info or other user info!')
    .setPerm
    .addUserOption((option) =>
        option.setName('target').setDescription('Select a user')
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
        let member, name, status, voice, memberRoles, customStatus;
        const target = interaction.options.getUser('target');

        member = interaction.member;
        if (target) member = await interaction.guild.members.fetch(target);

        name = member.displayName;
        status = !member.presence ? 'Offline' : member.presence.status;
        voice = !member.voice.channelId ? 'None' : `<#${member.voice.channelId}>`;
        memberRoles = !member.roles
            ? 'None'
            : member._roles.map((role) => `<@&${role}>`);

        customStatus = 'None';
        if (
            member.presence &&
      member.presence.activities &&
      member.presence.activities[0]
        ) {
            customStatus = member.presence.activities[0].state;
        }

        const userInfoEmbed = new MessageEmbed()
            .setColor('#992d22')
            .setTitle(`${name}'s Informations.`)
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: 'User Nickname',
                    value: name,
                    inline: true,
                },
                { name: 'User ID', value: `${member.user.id}`, inline: true },
                {
                    name: 'Status',
                    value: status,
                    inline: true,
                },
                {
                    name: 'In Voice',
                    value: voice,
                    inline: false,
                },
                {
                    name: 'Custom Status',
                    value: `${customStatus}`,
                    inline: false,
                },
                {
                    name: `Roles (${memberRoles.length})`,
                    value: `${memberRoles}`,
                    inline: false,
                },
                {
                    name: `Highest Role`,
                    value: `<@&${member.roles.highest.id}>`,
                    inline: false,
                },
                {
                    name: `Account Created`,
                    value: new Date(member.user.createdTimestamp).toUTCString(),
                    inline: true,
                },
                {
                    name: `Joined Created`,
                    value: new Date(member.joinedAt).toUTCString(),
                    inline: true,
                }
            )
            .setTimestamp();
        await interaction.editReply({ embeds: [userInfoEmbed] });
    } catch (error) {
        console.error(error);
    }
};
