const { MessageEmbed } = require('discord.js');
const footerText = 'Thread dibuat secara otomatis';

const autoThread = async (msg, client, channelId, threadTitle = 'Thread dari', threadDescription = 'Silahkan memberikan tanggapan dalam thread ini!') => {
    if(msg.channelId !== channelId) return;
    if(msg.author.id === msg.client.user.id) return;
    if(msg.author.bot) return;

    const threadAuthor = msg.member.displayName;
    const embeds = new MessageEmbed()
        .setColor('#FFE898')
        .setDescription(threadDescription)
        .setFooter(footerText)
        .setTimestamp();

    await msg.react('👍');
    await msg.react('👎');
    msg.startThread({
        name: `${threadTitle} ${threadAuthor}`,
        autoArchiveDuration: 60,
        type: 'GUILD_PUBLIC_THREAD'
    })
        .then(message => {
            message.send({ embeds: [embeds]});
        });
};

module.exports = {
    autoThread
};