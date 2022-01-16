const {
    splitMessages,
    sendMsg,
    getUserFromMention,
    embedError,
} = require('./utility');
const { MessageEmbed } = require('discord.js');

const pointSystem = async (msg, client, prisma) => {
    try {
        const { command, args } = splitMessages(msg);
        if (msg.webhookId || msg.author.bot) return;

        const staffRole = msg.member.roles.cache.some((roles) =>
            JSON.parse(process.env.ROLES_STAFF).includes(roles.id)
        );

        const hasKetuaRole = msg.member.roles.cache.has(process.env.ROLE_KETUA);
        const getUserMention = args[0];
        const pointValue = parseInt(args[1]);

        // Untuk mengecek profile moderator
        if (command === 'modprofile') {
            try {
                if (!hasKetuaRole) return;
                let members = await getUserFromMention(getUserMention, msg.guild);
                const embed = new MessageEmbed();
                if (!members) {
                    members = msg.member;
                }

                const ketuaData = await prisma.point.findFirst({
                    where: {
                        ketua_id: members.user.id,
                    },
                });

                const teamSide = members.roles.cache.has(process.env.ROLE_BELLSHADE)
                    ? 'Bellshade Team'
                    : 'Mod Team';

                if (!ketuaData) {
                    embed.setDescription(`<@${members.id}> didn't have any points`);
                } else {
                    embed
                        .setColor('#992d22')
                        .setDescription(`<@${members.user.id}>'s moderator profile`)
                        .setThumbnail(members.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            {
                                name: 'Tag',
                                value: members.user.tag,
                                inline: true,
                            },
                            {
                                name: 'ID',
                                value: members.user.id,
                                inline: true,
                            },
                            {
                                name: 'Point',
                                value: `${ketuaData.ketua_point}`,
                                inline: true,
                            },
                            {
                                name: `Highest Role`,
                                value: `<@&${members.roles.highest.id}>`,
                                inline: true,
                            },
                            {
                                name: `Team Side`,
                                value: `${teamSide}`,
                                inline: true,
                            },
                            {
                                name: 'Last modified by',
                                value: `${ketuaData.author_name}`,
                                inline: true,
                            }
                        )
                        .setFooter({
                            text: `Command used by: ${msg.author.tag}`,
                            iconURL: `${msg.author.displayAvatarURL({
                                dynamic: true,
                            })}`,
                        });
                }
                sendMsg(msg.channel, { embeds: [embed] });
            } catch (error) {
                console.log(error);
                return sendMsg(msg.channel, {
                    embeds: [embedError('An error occurred while executing the command.')],
                });
            }
        }

        // Menambah poin moderator (hanya dosen & staff yang bisa menggunakannya)
        if (command === 'addpoint') {
            try {
                if (!staffRole) return;
                let members = await getUserFromMention(getUserMention, msg.guild);
                if (!members) return msg.reply('Please enter a valid user');
                const points = await prisma.point.upsert({
                    where: {
                        ketua_id: members.user.id,
                    },
                    update: {
                        ketua_point: { increment: pointValue },
                        author_name: msg.author.username,
                        author_id: msg.author.id,
                    },
                    create: {
                        ketua_id: members.user.id,
                        ketua_name: members.user.username,
                        ketua_point: 1,
                        author_name: msg.author.username,
                        author_id: msg.author.id,
                    },
                });
                const embed = new MessageEmbed()
                    .setTitle('WPU for Moderator')
                    .setThumbnail(msg.guild.iconURL({ dynamic: true }))
                    .setDescription(
                        `**${msg.author.tag} add ${pointValue} point to ${members.user.tag}.** \n Now ${members.user.tag} have ${points.ketua_point} points`
                    )
                    .setFooter({
                        text: `Command used by: ${msg.author.tag}`,
                        iconURL: `${msg.author.displayAvatarURL({ dynamic: true })}`,
                    });
                sendMsg(msg.channel, {
                    embeds: [embed],
                });
            } catch (error) {
                console.log(error);
                return sendMsg(msg.channel, {
                    embeds: [
                        embedError(
                            'An error occurred while executing the command. Or because you didn\'t provide the valid number.'
                        ),
                    ],
                });
            }
        }

        // Mengurangi poin moderator (hanya dosen & staff yang bisa menggunakannya)
        if (command === 'decpoint') {
            try {
                if (!staffRole) return;
                let members = await getUserFromMention(getUserMention, msg.guild);
                if (!members) return msg.reply('Please enter a valid user');
                const points = await prisma.point.upsert({
                    where: {
                        ketua_id: members.user.id,
                    },
                    update: {
                        ketua_point: { decrement: pointValue },
                        author_name: msg.author.username,
                        author_id: msg.author.id,
                    },
                    create: {
                        ketua_id: members.user.id,
                        ketua_name: members.user.username,
                        ketua_point: 0,
                        author_name: msg.author.username,
                        author_id: msg.author.id,
                    },
                });
                const embed = new MessageEmbed()
                    .setTitle('WPU for Moderator')
                    .setThumbnail(msg.guild.iconURL({ dynamic: true }))
                    .setDescription(
                        `**${msg.author.tag} remove ${pointValue} point to ${members.user.tag}.** \n Now ${members.user.tag} have ${points.ketua_point} points`
                    )
                    .setFooter({
                        text: `Command used by: ${msg.author.tag}`,
                        iconURL: `${msg.author.displayAvatarURL({ dynamic: true })}`,
                    });
                sendMsg(msg.channel, {
                    embeds: [embed],
                });
            } catch (error) {
                console.log(error);
                return sendMsg(msg.channel, {
                    embeds: [
                        embedError(
                            'An error occurred while executing the command. Or because you didn\'t provide the valid number.'
                        ),
                    ],
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    pointSystem,
};
