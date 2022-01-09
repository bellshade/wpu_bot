const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

exports.command = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('View your or another user avatar!')
    .addUserOption(option => option.setName('target').setDescription('Select a user'));

exports.execute = async (interaction) => {
    try {
        await interaction.deferReply();
        let name, avatar;
        const user = interaction.options.getUser('target');
        if(!user) {
            name = interaction.member.displayName;
            avatar = interaction.member.avatarURL() ? interaction.member.avatarURL() : interaction.user.avatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
            avatar = avatar.replace('webp', 'png?size=256');
        } else {
            const member = await interaction.guild.members.fetch(user);
            name = member.displayName;
            avatar = member.avatarURL() ? member.avatarURL() : user.avatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png';
            avatar = avatar.replace('webp', 'png?size=256');
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
