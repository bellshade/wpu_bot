const { SlashCommandBuilder } = require('@discordjs/builders');
const { checkRoles } = require('../modules/utility');

const KETUA_KELAS_ID = process.env.ROLE_KETUA;

exports.command = new SlashCommandBuilder()
    .setName('helper-role')
    .setDescription('Add helper role command')
    .addStringOption((option) =>
        option
            .setName('action')
            .setDescription('Select an action')
            .setRequired(true)
            .addChoice('Add', 'add')
            .addChoice('Remove', 'remove'),
    )
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

    const action = interaction.options.getString('action');
    const prisma = interaction.client.prisma;
    const existingRole = await prisma.helper_role.findUnique({ where: { role_id: role.id } });

    if (existingRole && action === 'add') {
        return interaction.reply({ content: 'Role already exists!', ephemeral: true });
    }
    if (!existingRole && action === 'remove') {
        return interaction.reply({ content: 'Role does not exist!', ephemeral: true });
    }

    if (action === 'add') {
        await prisma.helper_role.create({
            data: {
                role_id: role.id,
                added_by: interaction.user.id,
            },
        });

        return interaction.reply({ content: 'Role added!', ephemeral: true });
    }

    if (action === 'remove') {
        await prisma.helper_role.delete({ where: { role_id: role.id } });
        return interaction.reply({ content: 'Role removed!', ephemeral: true });
    }
};
