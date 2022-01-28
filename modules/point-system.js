const { splitMessages, sendMsg, getUserFromMention, embedError, buildFooter } = require('./utility');
const { MessageEmbed } = require('discord.js');
const ROLE_STAFF_ID = process.env.ROLES_STAFF;
const ROLE_KETUA_ID = process.env.ROLE_KETUA;
const ROLE_BELLSHADE_ID = process.env.ROLE_BELLSHADE;

const pointSystem = async (msg, client, prisma) => {
    try {
        const { command, args } = splitMessages(msg);
        const roles = msg.member.roles;
        const channel = msg.channel;
        const guild = msg.guild;
        const staffRole = roles.cache.some(role => JSON.parse(ROLE_STAFF_ID).includes(role.id));
        const hasKetuaRole = roles.cache.has(ROLE_KETUA_ID);

        // Untuk mengecek profile moderator
        if (command === 'modprofile') {
            try {
                if (!hasKetuaRole) return;

                const getUserMention = args[0];
                const embed = new MessageEmbed();
                let members = await getUserFromMention(getUserMention, guild);

                if (!members) members = msg.member;

                const teamSide = members.roles.cache.has(ROLE_BELLSHADE_ID) ? 'Bellshade Team' : 'Mod Team';
                const ketuaData = await prisma.point.findFirst({
                    where: {
                        ketua_id: members.user.id
                    }
                });

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
                        .setFooter(buildFooter(msg));
                }
                sendMsg(channel, { embeds: [embed] });
            } catch (error) {
                console.log(error);
                const embed = embedError('An error occurred while executing the command.');
                return sendMsg(channel, { embeds: [embed] });
            }
        }

        // Menambah poin moderator (hanya dosen & staff yang bisa menggunakannya)
        if (command === 'addpoint') {
            try {
                if (!staffRole) return;

                const { members, first, last } = await getMembers(args, guild);
                const [pointValue, ...reason] = args.slice(first, last);

                for (const member of members) {
                    try {
                        const points = await updatePoint(prisma, msg.author, member, pointValue, 'add', reason.join(' '));
                        const embed = new MessageEmbed()
                            .setTitle('WPU for Moderator')
                            .setThumbnail(guild.iconURL({ dynamic: true }))
                            .setDescription(
                                `**${msg.author.tag} add ${pointValue} point to ${member.user.tag}.** reason: ${reason.join(' ')} \n Now ${member.user.tag} have ${points.ketua_point} points`
                            )
                            .setFooter(buildFooter(msg));

                        sendMsg( channel, { embeds: [embed] });
                    } catch (error) {
                        console.error(error);
                    }
                }
            } catch (error) {
                console.log(error);
                return sendError(channel);
            }
        }

        // Mengurangi poin moderator (hanya dosen & staff yang bisa menggunakannya)
        if (command === 'decpoint') {
            try {
                if (!staffRole) return;

                const { members, first, last } = await getMembers(args, guild);
                const [pointValue, ...reason] = args.slice(first, last);

                for (const member of members) {
                    try {
                        const points = await updatePoint(prisma, msg.author, member, pointValue, 'dec', reason.join(' '));
                        const embed = new MessageEmbed()
                            .setTitle('WPU for Moderator')
                            .setThumbnail(guild.iconURL({ dynamic: true }))
                            .setDescription(
                                `**${msg.author.tag} remove ${pointValue} point to ${member.user.tag}.** reason: ${reason.join(' ')} \n Now ${member.user.tag} have ${points.ketua_point} points`
                            )
                            .setFooter(buildFooter(msg));

                        sendMsg( channel, { embeds: [embed] });
                    } catch (error) {
                        console.error(error);
                    }
                }
            } catch (error) {
                console.log(error);
                return sendError(channel);
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const sendError = (channel) => {
    const embed = embedError(`An error occurred while executing the command. Or because you didn't provide the valid number.`);
    return sendMsg(channel, { embeds: [embed] });
};

const updatePoint = async (prisma, author, member, pointValue, type, reason) => {
    let ketua_point_update, ketua_point_create;

    try {
        switch (type) {
            case 'add':
                ketua_point_update = { increment: pointValue };
                ketua_point_create = pointValue;
                break;

            case 'dec':
                ketua_point_update = { decrement: pointValue };
                ketua_point_create = `-${pointValue}`;
                break;
        }

        const points = await prisma.point.upsert({
            where: {
                ketua_id: member.user.id,
            },
            update: {
                ketua_point: ketua_point_update,
                author_name: author.username,
                author_id: author.id,
            },
            create: {
                ketua_id: member.user.id,
                ketua_name: member.user.username,
                ketua_point: ketua_point_create,
                author_name: author.username,
                author_id: author.id,
            },
        });

        await prisma.point_history.create({
            data: {
                point_id: points.id,
                change: ketua_point_create,
                author_id: author.id,
                reason: reason
            }
        });

        return points;
    } catch (error) {
        throw new Error(error);
    }
};

const getMembers = async (args, guild) => {
    const members = [];
    const position = [];

    for (let i = 1; i < args.length; i++) {
        const data = args[i];
        const member = await getUserFromMention(data, guild);
        if (!member || member.bot) continue; // bukan user
        members.push(member);
        position.push(position);
    }

    return {
        members,
        first: position[0],
        last: position[-1]
    };
};

module.exports = {
    pointSystem,
};
