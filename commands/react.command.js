const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedError } = require('../modules/utility');

const KETUA_KELAS_ID = process.env.ROLE_KETUA;

exports.command = new SlashCommandBuilder()
    .setName('react')
    .setDescription('React to a message!')
    .addStringOption((option) =>
        option.setName('message-id').setDescription('The message you want to react').setRequired(true),
    )
    .addStringOption((option) =>
        option.setName('emoji').setDescription('The emoji you want to react').setRequired(true),
    );

exports.permissions = [
    {
        id: KETUA_KELAS_ID,
        type: 'ROLE',
        permission: true,
    },
];

exports.execute = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: true, fetchReply: true });

        const messageId = interaction.options.getString('message-id');
        const emojiOptions = interaction.options.getString('emoji');
        const message = await interaction.channel.messages.fetch(messageId);

        const emojis = emojiOptions.split(' ');
        for (const emoji of emojis) {
            await message.react(emoji);
        }

        return interaction.editReply({ content: 'Reacted!' });
    } catch (error) {
        console.error(error);
        let errorMessage = error.message ?? 'Something went wrong!';

        // Reference: https://discord.com/developers/docs/topics/opcodes-and-status-codes#:~:text=Unknown%20member-,10008,-Unknown%20message
        if (error.code === 10008) {
            errorMessage = 'Message not found!\nMake sure you are on the same channel with the message!';
        }

        const errorEmbed = embedError(errorMessage);
        return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
};
