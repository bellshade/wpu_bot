const { SlashCommandBuilder } = require('@discordjs/builders');

exports.commands = [
    new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
    new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
];

exports.command = new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!');

exports.execute = async (interaction) => {
    interaction.reply('Pong!');
};
