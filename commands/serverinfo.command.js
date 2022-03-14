const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const MAHASISWA_ID = process.env.ROLES_MAHASISWA;

exports.command = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('View some information about the server');

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
        const guild = interaction.guild;
        let members = await interaction.guild.members.fetch({ withPresences: true });
        let onlineMembers = {
            online: await members.filter( (online) => online.presence?.status === 'online' ).size,
            idle: await members.filter((online) => online.presence?.status === 'idle').size,
            dnd: await members.filter((online) => online.presence?.status === 'dnd').size,
        };

        const onlineMemberCount = onlineMembers.online + onlineMembers.idle + onlineMembers.dnd;
        const boostLevel = guild.premiumTier === 'NONE' ? '0' : guild.premiumTier.slice(5);
        const serverInfoEmbed = new MessageEmbed()
            .setColor('#992d22')
            .setTitle('WPU Server Informations')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                {
                    name: 'Server Owner',
                    value: `<@${guild.ownerId}>`,
                    inline: true,
                },
                {
                    name: 'Server ID',
                    value: guild.id,
                    inline: true,
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true,
                },
                {
                    name: 'Members Informations',
                    value: `All members: ${guild.memberCount}
                    Members: ${guild.members.cache.filter((member) => !member.user.bot).size}
                    Bots: ${guild.members.cache.filter((member) => member.user.bot).size}
                    Online members: ${onlineMemberCount}
                    Offline members: ${guild.memberCount - onlineMemberCount}`,
                    inline: true,
                },
                {
                    name: 'Server Informations',
                    value: `Total roles: ${guild.roles.cache.size}
                    Categories: ${guild.channels.cache.filter((guildInfo) => guildInfo.type === 'GUILD_CATEGORY').size}
                    Total channels: ${guild.channels.cache.size}
                    Text channels: ${guild.channels.cache.filter((guildInfo) => guildInfo.type === 'GUILD_TEXT').size}
                    Voice channels: ${guild.channels.cache.filter((guildInfo) => guildInfo.type === 'GUILD_VOICE').size}
                    Boost level: ${boostLevel} 
                    Total boost: ${guild.premiumSubscriptionCount}
                    Server created at: ${new Date(guild.createdTimestamp).toLocaleDateString()}`,
                    inline: true,
                }
            )
            .setTimestamp();
        await interaction.editReply({ embeds: [serverInfoEmbed] });
    } catch (error) {
        console.error(error);
    }
};