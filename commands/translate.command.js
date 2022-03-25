const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const translate = require('@vitalets/google-translate-api');
const languageArray = require('../data/language.json');
const languageMap = languageArray.map((lang) => {
    return [lang.name, lang.code];
});

const MAHASISWA_ID = process.env.ROLES_MAHASISWA;

exports.command = new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate some text!')
    .addStringOption((option) => option.setName('language').setDescription('Translates a text to this language').setRequired(true).addChoices(languageMap))
    .addStringOption((option) => option.setName('text').setDescription('The text you want to translate').setRequired(true));

exports.permissions = [
    {
        id: MAHASISWA_ID,
        type: 'ROLE',
        permission: true,
    },
];

exports.execute = async (interaction) => {
    try {
        await interaction.deferReply();
        const embed = new MessageEmbed();
        const language = interaction.options.getString('language');
        const text = interaction.options.getString('text');
        const translationResult = await translate(text, { to: language });
        const filterLanguage = languageArray.filter((lang) => lang.code === language || lang.name === language.charAt(0).toUpperCase() + language.slice(1));
        const filterLanguageFrom = languageArray.filter((lang) => lang.code === translationResult.from.language.iso);

        const languageFrom = () => {
            try {
                return filterLanguageFrom[0].name;
            } catch (error) {
                return 'Auto';
            }
        };

        embed
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`${translationResult.text}`)
            .setColor('#4752c4')
            .setFooter({ text: `${languageFrom()} → ${filterLanguage[0].name}` });
        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
    }
};
