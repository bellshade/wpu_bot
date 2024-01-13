const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { checkRoles } = require('../modules/utility');

const KETUA_KELAS_ID = process.env.ROLE_KETUA;

exports.command = new SlashCommandBuilder()
    .setName('add-helper-role')
    .setDescription('Add helper role command')
    .addRoleOption((option) => option.setName('role').setDescription('Select a role').setRequired(true));

exports.permissions = [
    {
        id: KETUA_KELAS_ID,
        type: 'ROLE',
        permission: true,
    },
];

exports.execute = async (interaction) => {
    if (!checkRoles(interaction)) {
        return interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    if (!role.name.startsWith('Helper-')) {
        return interaction.reply({ content: 'Invalid role!', ephemeral: true });
    }

    const prisma = interaction.client.prisma;
    const existingRole = await prisma.helper_role.findUnique({ where: { role_id: role.id } });
    if (existingRole) {
        return interaction.reply({ content: 'Role already exists!', ephemeral: true });
    }

    await prisma.helper_role.create({
        data: {
            role_id: role.id,
            added_by: interaction.user.id,
        },
    });

    await interaction.reply({ content: 'Role added!', ephemeral: true });
};
