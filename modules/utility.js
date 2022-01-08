require('dotenv').config();
const { MessageEmbed } = require('discord.js');

function checkRoles(msg) {
    // Check if they have one of many roles
    if ( msg.member.roles.cache.some((role) => JSON.parse(process.env.ROLE).includes(role.id) ) ) {
        return true;
    }

    return false;
}

function getUserFromMention(mention, client) {
    if (!mention) return false;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.fetch(mention);
    }

    return false;
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
        .setColor("RED");
}

function splitMessages(msg, withPrefix = false) {
    let command, args;
    if(withPrefix) {
        const split = msg.content.split(/ +/);
        command = split[0].toLowerCase();
        args = split.slice(1);
    } else {
        const withoutPrefix = msg.content.slice(process.env.PREFIX.length);
        const split = withoutPrefix.split(/ +/);
        command = split[0].toLowerCase();
        args = split.slice(1);
    }

    return { command, args };
}

function checkPermission(msg, guildMember) {
    const errorMsg = `You can't do this to user with the same or a higher role.`;
    return new Promise((resolve) => {
        if ( guildMember.roles.highest.position >= msg.guild.me.roles.highest.position && msg.member.roles.highest.position || msg.guild.ownerId == guildMember.id) {
            sendMsg(msg.channel, { embeds: [replyEmbedError(msg, errorMsg)] });
            resolve(false);
        } else {
            resolve(true);
        }
    });
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
    deleteMsg,
    splitMessages,
    checkPermission
};
