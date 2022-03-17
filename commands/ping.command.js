const { SlashCommandBuilder } = require('@discordjs/builders');

const MAHASISWA_ID = process.env.ROLES_MAHASISWA;

exports.command = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!');

exports.permissions = [
    {
        id: MAHASISWA_ID,
        type: 'ROLE',
        permission: true
    }
];

exports.execute = async (interaction) => {
    interaction.reply({content:'Pong!', ephemeral: true});
};
