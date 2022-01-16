const { MessageEmbed } = require('discord.js');

const {
    splitMessages,
    sendMsg,
    getChannelData,
    getRoleData,
    getUserFromMention,
    embedError,
} = require('./utility');

const Info = async (msg) => {
    try {
        const { command, args, hasPrefix } = splitMessages(msg);
        if(!hasPrefix) return;

        const userUndefined = 'User not found';
        const channelUndefined = 'Channel not found';
        const roleUndefined = 'Role not found';

        // avatar command
        if (command === 'avatar') {
            try {
                const memberMention = args[0];
                let members = await getUserFromMention(memberMention, msg.guild);
                if (!members) members = msg.member;
                const userAvatarEmbed = new MessageEmbed()
                    .setColor('#992d22')
                    .setTitle(`${members.user.username}'s avatar.`)
                    .setURL(members.displayAvatarURL())
                    .setImage(members.displayAvatarURL({ dynamic: true, size: 2048 }))
                    .setFooter({
                        text: `Command used by: ${msg.author.username}`,
                        iconURL: `${msg.author.displayAvatarURL({
                            dynamic: true,
                        })}`,
                    });
                sendMsg(msg.channel, { embeds: [userAvatarEmbed] });
            } catch (error) {
                console.log(error);
                return msg.reply({
                    embeds: [embedError(userUndefined)],
                });
            }
        }

        // userinfo command
        if (command === 'userinfo') {
            try {
                let members = await getUserFromMention(args[0], msg.guild);
                let customStatus = 'None';

                if (!members) members = msg.member;
                const nickname = !members.nickname ? members.user.username : members.nickname;
                const status = members.presence?.status || 'Offline';
                const voice = !members.voice.channelId ? 'None' : `<#${members.voice.channelId}>`;
                const memberRoles = members._roles.map((role) => `<@&${role}>`);
                if (
                    members.presence &&
                    members.presence.activities &&
                    members.presence.activities[0]
                ) {
                    customStatus = members.presence.activities[0].state;
                }

                const userInfoEmbed = new MessageEmbed()
                    .setColor('#992d22')
                    .setTitle(`${members.user.username}'s Informations.`)
                    .setThumbnail(members.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        {
                            name: 'User Nickname',
                            value: nickname,
                            inline: true,
                        },
                        {
                            name: 'User ID',
                            value: `${members.user.id}`,
                            inline: true,
                        },
                        {
                            name: 'Status',
                            value: status,
                            inline: true,
                        },
                        {
                            name: 'In Voice',
                            value: voice,
                            inline: false,
                        },
                        {
                            name: 'Custom Status',
                            value: `${customStatus}`,
                            inline: false,
                        },
                        {
                            name: `Roles (${memberRoles.length})`,
                            value: `${memberRoles}`,
                            inline: false,
                        },
                        {
                            name: `Highest Role`,
                            value: `<@&${members.roles.highest.id}>`,
                            inline: false,
                        },
                        {
                            name: `Account Created`,
                            value: new Date(members.user.createdTimestamp).toUTCString(),
                            inline: true,
                        },
                        {
                            name: `Joined Created`,
                            value: new Date(members.joinedAt).toUTCString(),
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: `Command used by: ${msg.author.username}`,
                        iconURL: `${msg.author.displayAvatarURL({
                            dynamic: true,
                        })}`,
                    });
                sendMsg(msg.channel, { embeds: [userInfoEmbed] });
            } catch (error) {
                console.log(error);
                return msg.reply({
                    embeds: [embedError(userUndefined)],
                });
            }
        }

        // server icon command
        if (command === 'servericon') {
            const serverIconEmbed = new MessageEmbed()
                .setColor('#992d22')
                .setTitle(`${msg.guild.name}'s icon.`)
                .setURL(msg.guild.iconURL())
                .setImage(msg.guild.iconURL({ dynamic: true, size: 2048 }))
                .setFooter({
                    text: `Command used by: ${msg.author.username}`,
                    iconURL: `${msg.author.displayAvatarURL({ dynamic: true })}`,
                });
            sendMsg(msg.channel, { embeds: [serverIconEmbed] });
        }

        // server info command
        if (command === 'serverinfo') {
            let members = await msg.guild.members.fetch({ withPresences: true });

            const onlineMembers = {
                online: await members.filter(
                    (online) => online.presence?.status === 'online'
                ).size,
                idle: await members.filter(
                    (online) => online.presence?.status === 'idle'
                ).size,
                dnd: await members.filter((online) => online.presence?.status === 'dnd')
                    .size,
            };

            const onlineMemberCount = onlineMembers.online + onlineMembers.idle + onlineMembers.dnd;
            const boostLevel = msg.guild.premiumTier === 'NONE' ? '0' : msg.guild.premiumTier.slice(5);
            const serverInfoEmbed = new MessageEmbed()
                .setColor('#992d22')
                .setTitle('WPU Server Informations')
                .setThumbnail(msg.guild.iconURL({ dynamic: true }))
                .addFields(
                    {
                        name: 'Server Owner',
                        value: `<@${msg.guild.ownerId}>`,
                        inline: true,
                    },
                    {
                        name: 'Server ID',
                        value: msg.guild.id,
                        inline: true,
                    },
                    {
                        name: '\u200B',
                        value: '\u200B',
                        inline: true,
                    },
                    {
                        name: 'Members Informations',
                        value: `All members: ${msg.guild.memberCount} \n Members: ${
                            msg.guild.members.cache.filter((member) => !member.user.bot).size
                        } \n Bots: ${
                            msg.guild.members.cache.filter((member) => member.user.bot).size
                        } \n Online members: ${onlineMemberCount} \n Offline members: ${
                            msg.guild.memberCount - onlineMemberCount
                        }`,
                        inline: true,
                    },
                    {
                        name: 'Server Informations',
                        value: `Total roles: ${msg.guild.roles.cache.size} \n Categories: ${
                            msg.guild.channels.cache.filter(
                                (guild) => guild.type === 'GUILD_CATEGORY'
                            ).size
                        } \n Total channels: ${
                            msg.guild.channels.cache.size
                        } \n Text channels: ${
                            msg.guild.channels.cache.filter(
                                (guild) => guild.type === 'GUILD_TEXT'
                            ).size
                        } \n Voice channels: ${
                            msg.guild.channels.cache.filter(
                                (guild) => guild.type === 'GUILD_VOICE'
                            ).size
                        } \n Boost level: ${boostLevel} \n Total boost: ${
                            msg.guild.premiumSubscriptionCount
                        } \n Server created at: ${new Date(
                            msg.guild.createdTimestamp
                        ).toLocaleDateString()}`,
                        inline: true,
                    }
                )
                .setFooter({
                    text: `Command used by: ${msg.author.username}`,
                    iconURL: `${msg.author.displayAvatarURL({ dynamic: true })}`,
                });
            sendMsg(msg.channel, { embeds: [serverInfoEmbed] });
        }

        // role info command
        if (command === 'roleinfo') {
            try {
                const roleMention = args[0];
                const role = await getRoleData(msg, roleMention);
                const members = role.members.map((member) => member.user.username);
                const roleInfoEmbed = new MessageEmbed()
                    .setColor('#992d22')
                    .setDescription(`**${role.name}**`)
                    .addFields(
                        {
                            name: 'Users',
                            value: `${role.members.size}`,
                            inline: true,
                        },
                        {
                            name: 'Mentionable',
                            value: `${role.mentionable}`,
                            inline: true,
                        },
                        { name: 'Hoist', value: `${role.hoist}`, inline: true },
                        {
                            name: 'Position',
                            value: `${role.position}`,
                            inline: true,
                        },
                        { name: 'Managed', value: `${role.managed}`, inline: true },
                        { name: 'Color', value: `${role.hexColor}`, inline: true },
                        {
                            name: 'Creation Date',
                            value: new Date(role.createdTimestamp).toLocaleString(),
                            inline: false,
                        },
                        {
                            name: 'Members',
                            value: members.join(', '),
                            inline: false,
                        },
                        { name: 'Role ID', value: role.id, inline: false }
                    );
                sendMsg(msg.channel, { embeds: [roleInfoEmbed] });
            } catch (error) {
                console.log(error);
                return msg.reply({
                    embeds: [embedError(roleUndefined)],
                });
            }
        }

        // channel info command
        if (command === 'channelinfo') {
            try {
                const channelMention = args[0];
                const Channel = await getChannelData(msg, channelMention);
                const channelInfoEmbed = new MessageEmbed()
                    .setColor('#992d22')
                    .setDescription(`<#${Channel.id}>`)
                    .addFields(
                        {
                            name: 'Name',
                            value: Channel.name,
                            inline: true,
                        },
                        {
                            name: 'Server',
                            value: Channel.guild.name,
                            inline: true,
                        },
                        {
                            name: 'ID',
                            value: Channel.id,
                            inline: true,
                        },
                        {
                            name: 'Category ID',
                            value: Channel.parentId,
                            inline: true,
                        },
                        {
                            name: 'Position',
                            value: `${Channel.position + 1}`,
                            inline: true,
                        },
                        {
                            name: 'NSFW',
                            value: `${Channel.nsfw}`,
                            inline: true,
                        },
                        {
                            name: 'Members (cached)',
                            value: `${Channel.members.size}`,
                            inline: true,
                        },
                        {
                            name: 'Category',
                            value: Channel.parent.name,
                            inline: true,
                        },
                        {
                            name: 'Created at',
                            value: new Date(Channel.createdTimestamp).toLocaleString(),
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: `Command used by: ${msg.author.username}`,
                        iconURL: `${msg.author.displayAvatarURL({
                            dynamic: true,
                        })}`,
                    });
                sendMsg(msg.channel, { embeds: [channelInfoEmbed] });
            } catch (error) {
                console.log(error);
                return msg.reply({
                    embeds: [embedError(channelUndefined)],
                });
            }
        }
    } catch (error) {
        console.log(error);
        return msg.reply('An error occurred while executing the command');
    }
};

module.exports = {
    Info,
};
