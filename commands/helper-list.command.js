const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const MAHASISWA_ID = process.env.ROLES_MAHASISWA;
const CHANNEL_HELPER_ID = process.env.CHANNEL_HELPER;

exports.command = new SlashCommandBuilder()
    .setName('helper-list')
    .setDescription('Helper list command')
    .addRoleOption((option) => option.setName('role').setDescription('Select a role'));

exports.permissions = [
    {
        id: MAHASISWA_ID,
        type: 'ROLE',
        permission: true,
    },
];

exports.execute = async (interaction) => {
    await interaction.deferReply();

    try {
        const prisma = interaction.client.prisma;
        const role = interaction.options.getRole('role');

        if (!role) {
            const allHelperRoles = await prisma.helper_role.findMany();
            let totalMember = 0;

            allHelperRoles.forEach((helperRole) => {
                totalMember += interaction.guild.roles.cache.get(helperRole.role_id).members.size;
            });

            const allHelperEmbed = new MessageEmbed()
                .setColor('#992d22')
                .setDescription(`**All Helpers**`)
                .addFields(
                    { name: 'Total Roles', value: allHelperRoles.length.toString(), inline: true },
                    { name: 'Total Members', value: totalMember.toString(), inline: true },
                );

            await Promise.all(
                allHelperRoles.map(async (helperRole) => {
                    const roleName = interaction.guild.roles.cache.get(helperRole.role_id).name;
                    const members = interaction.guild.roles.cache
                        .get(helperRole.role_id)
                        .members.map((member) => member.user.id);
                    const listMembers = members.length
                        ? members.map((member) => `- <@${member}>`).join('\n')
                        : '- No one here :(';

                    allHelperEmbed.addField(`**${roleName}**`, listMembers);
                }),
            );

            return await interaction.editReply({ embeds: [allHelperEmbed] });
        }

        const helperRole = await prisma.helper_role.findUnique({ where: { role_id: role.id } });
        if (!helperRole) {
            return await interaction.editReply({ content: 'Role not found!' });
        }

        const roleMemberIds = interaction.guild.roles.cache.get(role.id).members.map((member) => member.user.id);
        const members = await Promise.all(
            roleMemberIds.map(async (memberId) => {
                const [firstMessage, lastMessage, lastMessageCountIn30Days] = await Promise.all([
                    prisma.messages.findFirst({
                        where: { author_id: memberId, channel_id: CHANNEL_HELPER_ID },
                        orderBy: { timestamp: 'asc' },
                    }),
                    prisma.messages.findFirst({
                        where: { author_id: memberId },
                        orderBy: { timestamp: 'desc' },
                    }),
                    prisma.messages.count({
                        where: {
                            author_id: memberId,
                            timestamp: {
                                gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
                            },
                        },
                    }),
                ]);

                return {
                    id: memberId,
                    joinedDate: firstMessage ? firstMessage.timestamp : null,
                    lastMessageDate: lastMessage ? lastMessage.timestamp : null,
                    lastMessageCountIn30Days,
                };
            }),
        );

        const listMembers = members.length
            ? members
                  .sort((a, b) => a.joinedDate - b.joinedDate)
                  .map((member) => {
                      const joinedDate = member.joinedDate ? new Date(member.joinedDate).toLocaleString() : 'No data';
                      const lastMessageDate = member.lastMessageDate
                          ? new Date(member.lastMessageDate).toLocaleString()
                          : 'No message';

                      return `${joinedDate} - <@${member.id}> - ${lastMessageDate} - ${member.lastMessageCountIn30Days} messages`;
                  })
                  .join('\n')
            : 'No one here :(';
        const embed = new MessageEmbed().setColor('#992d22').setDescription(`**<@&${role.id}>**`).addFields(
            { name: 'Total Members', value: roleMemberIds.length.toString(), inline: true },
            {
                name: 'List Members\nDate joined - Name - Last message - Total messages in last month',
                value: listMembers,
                inline: false,
            },
        );

        return await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);

        const embed = new MessageEmbed()
            .setColor('#992d22')
            .setDescription(`**Something went wrong!**`)
            .addFields({ name: 'Error', value: error.message, inline: false });
        return await interaction.editReply({ embeds: [embed] });
    }
};
