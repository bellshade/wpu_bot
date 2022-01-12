require("dotenv").config();
const {
    splitMessages,
    sendMsg,
    getUserFromMention,
    embedError,
} = require("./utility");
const { MessageEmbed } = require("discord.js");

const pointSystem = async (msg, client, prisma) => {
    const { command, args } = splitMessages(msg);

    const OPRole = msg.member.roles.cache.some((roles) =>
        JSON.parse(process.env.OPROLE).includes(roles.id)
    );

    const role = msg.member.roles.cache.has(process.env.KROLE);

    // Untuk mengecek profile moderator
    if (command === "modprofile") {
        try {
            if (!role) return;
            let Member = await getUserFromMention(args[0], msg.guild);
            const embed = new MessageEmbed();
            if (!Member) {
                Member = msg.member;
            }

            const point = await prisma.point.findFirst({
                where: {
                    ketua_id: Member.user.id,
                },
            });

            const teamSide = Member.roles.cache.has(process.env.BROLE)
                ? "Bellshade Team"
                : "Mod Team";

            if (point === null) {
                embed.setDescription(`<@${Member.id}> didn't have any points`);
            } else {
                embed
                    .setColor("#992d22")
                    .setDescription(`<@${Member.user.id}>'s moderator profile`)
                    .setThumbnail(Member.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        {
                            name: "Tag",
                            value: Member.user.tag,
                            inline: true,
                        },
                        {
                            name: "ID",
                            value: Member.user.id,
                            inline: true,
                        },
                        {
                            name: "Point",
                            value: `${point.ketua_point}`,
                            inline: true,
                        },
                        {
                            name: `Highest Role`,
                            value: `<@&${Member.roles.highest.id}>`,
                            inline: true,
                        },
                        {
                            name: `Team Side`,
                            value: `${teamSide}`,
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
                embeds: [embedError("An error occurred while executing the command.")],
            });
        }
    }

    // Menambah poin moderator (hanya dosen & staff yang bisa menggunakannya)
    if (command === "addpoint") {
        try {
            if (!OPRole) return;
            let Member = await getUserFromMention(args[0], msg.guild);
            if (!Member) return msg.reply("Please enter a valid user");
            const Point = await prisma.point.upsert({
                where: {
                    ketua_id: Member.user.id,
                },
                update: {
                    ketua_point: { increment: args[1] },
                    author_name: msg.author.tag,
                    author_id: msg.author.id,
                },
                create: {
                    ketua_id: Member.user.id,
                    ketua_name: Member.user.tag,
                    ketua_point: "1",
                    author_name: msg.author.tag,
                    author_id: msg.author.id,
                },
            });
            const embed = new MessageEmbed()
                .setTitle("WPU for Moderator")
                .setThumbnail(msg.guild.iconURL({ dynamic: true }))
                .setDescription(
                    `**${msg.author.tag} add ${args[1]} point to ${Member.user.tag}.** \n Now ${Member.user.tag} have ${Point.ketua_point} points`
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
                        "An error occurred while executing the command. Or because you didn't provide the valid number."
                    ),
                ],
            });
        }
    }

    // Mengurangi poin moderator (hanya dosen & staff yang bisa menggunakannya)
    if (command === "decpoint") {
        try {
            if (!OPRole) return;
            let Member = await getUserFromMention(args[0], msg.guild);
            if (!Member) return msg.reply("Please enter a valid user");
            const Point = await prisma.point.upsert({
                where: {
                    ketua_id: Member.user.id,
                },
                update: {
                    ketua_point: { decrement: args[1] },
                    author_name: msg.author.tag,
                    author_id: msg.author.id,
                },
                create: {
                    ketua_id: Member.user.id,
                    ketua_name: Member.user.tag,
                    ketua_point: "0",
                    author_name: msg.author.tag,
                    author_id: msg.author.id,
                },
            });
            const embed = new MessageEmbed()
                .setTitle("WPU for Moderator")
                .setThumbnail(msg.guild.iconURL({ dynamic: true }))
                .setDescription(
                    `**${msg.author.tag} remove ${args[1]} point to ${Member.user.tag}.** \n Now ${Member.user.tag} have ${Point.ketua_point} points`
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
                        "An error occurred while executing the command. Or because you didn't provide the valid number."
                    ),
                ],
            });
        }
    }

    // Otomatis menambah dan mengurangi poin moderator (dilakukan pada hari yang ditentukan oleh dosen/staff)
    if (command === "modpoint") {
        try {
            if (!OPRole) return;
            const ketuaRole = msg.guild.roles.cache.get(process.env.KROLE);
            const memberRole = ketuaRole.members.map((member) => member.user);

            for (const member of memberRole) {
                const allMsg = await prisma.messages.findMany({
                    where: {
                        author_id: member.id,
                    },
                });
                var massCreateNew = {
                    ketua_id: member.id,
                    ketua_name: member.tag,
                    ketua_point: "1",
                    author_name: client.user.tag,
                    author_id: client.user.id,
                };
                const lastMsg = allMsg.slice(-1);
                const date = lastMsg.map((m) => new Date(m.timestamp).getDate());
                for (const d of date) {
                    const calc = new Date().getDate() - d;
                    if (calc <= 7) {
                        await prisma.point.upsert({
                            where: {
                                ketua_id: member.id,
                            },
                            update: {
                                ketua_point: { increment: 1 },
                                author_name: client.user.tag,
                                author_id: client.user.id,
                            },
                            create: massCreateNew,
                        });
                    } else {
                        await prisma.point.upsert({
                            where: {
                                ketua_id: member.id,
                            },
                            update: {
                                ketua_point: { decrement: 1 },
                                author_name: client.user.tag,
                                author_id: client.user.id,
                            },
                            create: massCreateNew,
                        });
                    }
                }
            }
            msg.react("👍");
        } catch (error) {
            console.log(error);
            return sendMsg(msg.channel, {
                embeds: [embedError("An error occurred while executing the command.")],
            });
        }
    }
};

module.exports = {
    pointSystem,
};
