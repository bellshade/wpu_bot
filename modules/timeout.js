const { MessageEmbed } = require('discord.js');

const {
    checkRoles,
    sendMsg,
    splitMessages,
    getUserFromMention,
    checkPermission,
} = require('./utility');

const timeCalc = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
};

const Timeout = async (msg) => {
    try {
        const { command, args } = splitMessages(msg);

        if (command !== 'timeout') return;
        if (!checkRoles(msg)) return;

        const users = [];
        for (let i = 2; i < args.length; i++) {
            const data = args[i];
            const user = await getUserFromMention(data, msg.guild);
            if (!user || user.bot) continue; // bukan user
            users.push(user);
        }

        if (users.length == 0) {
            msg.reply('Please mention a user');
            return;
        }

        const timeType = args[0].slice(-1);
        // Check format waktu apakah sudah sesuai
        if (!['s', 'm', 'h', 'd'].includes(timeType)) {
            msg.reply('Please set the time');
            return;
        }

        const duration = parseInt(args[0].slice(0, -1)) || 0;
        const durationMs = Math.floor(duration * (timeCalc[timeType] || 1) * 1000); // Covert duration to miliseconds
        // check apakah durasi melebihi batas maksimum
        if (durationMs >= 2419200000) {
            msg.reply('Maximal timeout is 27d');
            return;
        }

        for (const user of users) {
            try {
                const guildMember = await msg.guild.members.fetch(user.id);
                if (!await checkPermission(msg, guildMember)) return;
                const timeoutEmbed = new MessageEmbed()
                    .setColor('#992d22')
                    .setDescription(`<@${user.id}> has been timeout`);
                await guildMember.timeout(durationMs, args[1]);
                sendMsg(msg.channel, { embeds: [timeoutEmbed] });
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    Timeout,
};
