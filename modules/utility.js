require('dotenv').config();
const { MessageEmbed } = require('discord.js');

function checkRoles(msg) {
    // Check if they have one of many roles
    if (
        msg.member.roles.cache.some((role) =>
            JSON.parse(process.env.ROLE).includes(role.id)
        )
    ) {
        return true;
    }

    return false;
}

async function getUserFromMention(mention, guild) {
    try {
        if (!mention) return false;

        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<@!?(\d+)>$/i);
        if(matches && matches[1]) return await guild.members.fetch(matches[1]);

        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function buildFooter(msg) {
    return {
        text: `Command used by: ${msg.author.tag}`,
        iconURL: `${msg.author.displayAvatarURL({ dynamic: true })}`,
    };
}

function embedError(msg = 'Error') {
    return new MessageEmbed()
        .setDescription(`:x: ${msg}`)
        .setColor('RED')
        .setTimestamp();
}

function embedSuccess(msg = 'Success') {
    return new MessageEmbed()
        .setDescription(`:white_check_mark: ${msg}`)
        .setColor('GREEN')
        .setTimestamp();
}

function embedMsg(msg = '') {
    return new MessageEmbed()
        .setDescription(`${msg}`)
        .setColor('NOT_QUITE_BLACK')
        .setTimestamp();
}

function embedLog(msg = '', title = 'Server Log', mention = '') {
    return new MessageEmbed()
        .setTitle(title)
        .setDescription(`\`\`\`${msg}\`\`\`${mention}`)
        .setColor('NOT_QUITE_BLACK')
        .setTimestamp();
}

function makeRoleMentions(rolesId = []) {
    const roles = [];
    if (rolesId == undefined || rolesId == null) return;
    for (let i = 0; i < rolesId.length; i++) {
        const role = rolesId[i];
        if (role == undefined || role == null || role == '') {
            continue;
        }
        roles.push(`<@&${role}>`);
    }
    return roles.join(' ');
}

function sendMsg(channel, msg) {
    try {
        channel.send(msg);
    } catch (error) {
        console.error(error);
    }
}

function sendTempMsg(channel, msg) {
    channel
        .send(msg)
        .then(async (wMsg) => {
            await new Promise((r) => setTimeout(r, 5000)); // Sleep for 5 seconds
            deleteMsg(wMsg);
        })
        .catch((e) => console.error(e));
}

function deleteMsg(msg) {
    try {
        msg.delete();
    } catch (error) {
        console.error(error);
    }
}

function replyEmbedError(msg, error) {
    return new MessageEmbed()
        .setDescription(`:x: <@${msg.author.id}>, ${error}`)
        .setColor('RED');
}

function splitMessages(msg, withPrefix = false) {
    const regex = new RegExp(process.env.PREFIX, 'gi');
    let command, args, split, hasPrefix;
    hasPrefix = true;
    split = msg.content.split(/ +/);

    if(!split[0].match(regex)) hasPrefix = false;
    if(!withPrefix) {
        const withoutPrefix = msg.content.slice(process.env.PREFIX.length);
        split = withoutPrefix.split(/ +/);
    }

    command = split[0].toLowerCase();
    args = split.slice(1);

    return { command, args, hasPrefix };
}

function checkPermission(msg, guildMember) {
    const errorMsg = `You can't do this to user with the same or a higher role.`;
    return new Promise((resolve) => {
        if (
            guildMember.roles.highest.position >=
            msg.guild.me.roles.highest.position &&
            msg.member.roles.highest.position ||
            msg.guild.ownerId == guildMember.id
        ) {
            sendMsg(msg.channel, { embeds: [replyEmbedError(msg, errorMsg)] });
            resolve(false);
        } else {
            resolve(true);
        }
    });
}

function interactionCheckPermission(interaction, guildMember) {
    const errorMsg = `:x: You can't do this to user with the same or a higher role.`;
    return new Promise((resolve) => {
        if (
            guildMember.roles.highest.position >=
            interaction.guild.me.roles.highest.position &&
            interaction.member.roles.highest.position ||
            interaction.guild.ownerId == guildMember.id
        ) {
            interaction.editReply({ embeds: [embedError(errorMsg)], ephemeral: true });
            resolve(false);
        } else {
            resolve(true);
        }
    });
}

async function getChannelData(msg, args) {
    try {
        const mentions = msg.mentions;
        const channels = msg.guild.channels;

        const mention = mentions.channels.first();
        let channelId = msg.channel.id;

        if (args) channelId = args;
        if (mention) channelId = mention.id;

        return await channels.fetch(channelId);
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function getRoleData(msg, args) {
    try {
        const mentions = msg.mentions;
        const roles = msg.guild.roles;

        const mention = mentions.roles.first();
        let roleId = args;

        if (mention) roleId = mention.id;

        return await roles.fetch(roleId);
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    checkRoles,
    embedError,
    embedSuccess,
    embedMsg,
    embedLog,
    getUserFromMention,
    makeRoleMentions,
    sendMsg,
    sendTempMsg,
    deleteMsg,
    splitMessages,
    checkPermission,
    getChannelData,
    getRoleData,
    buildFooter,
    interactionCheckPermission
};
