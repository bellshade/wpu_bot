const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const MAHASISWA_ID = process.env.ROLES_MAHASISWA;

exports.command = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('View your or another user avatar!')
    .addUserOption(option => option.setName('target').setDescription('Select a user'));

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
        let name, avatar;
        const user = interaction.options.getUser('target');
        if(!user) {
            name = interaction.member.displayName;
            avatar = interaction.member.displayAvatarURL({dynamic: true, size: 256});
        } else {
            const member = await interaction.guild.members.fetch(user);
            name = member.displayName;
            avatar = member.displayAvatarURL({dynamic: true, size: 256});
        }
        const embed = new MessageEmbed()
            .setTitle(`${name}'s avatar.`)
            .setURL(avatar)
            .setImage(avatar)
            .setColor('ORANGE')
            .setTimestamp();
        await interaction.editReply({embeds: [embed]});
    } catch (error) {
        console.error(error);
    }
};
