const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

exports.command = new SlashCommandBuilder().setName('servericon').setDescription('View server icons');
exports.execute = async (interaction) => {
    try {
        await interaction.deferReply();
        const name = interaction.guild.name;
        const icon = interaction.guild.iconURL({ dynamic: true, size: 2048 });
        const serverIconEmbed = new MessageEmbed()
            .setColor("#992d22")
            .setTitle(`${name}'s icon.`)
            .setURL(icon)
            .setImage(icon)
            .setTimestamp();
        await interaction.editReply({ embeds: [serverIconEmbed] });
    } catch (error) {
        console.error(error);
    }
};