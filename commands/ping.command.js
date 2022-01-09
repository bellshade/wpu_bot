const { SlashCommandBuilder } = require('@discordjs/builders');

exports.command = new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!');

exports.execute = async (interaction) => {
    interaction.reply({content:'Pong!', ephemeral: true});
};
