const { MessageEmbed } = require('discord.js');

const autoThread = async (msg, client, channelId) => {
    if(msg.channelId != channelId) return;
    if(msg.author.id === msg.client.user.id) return;
    if(msg.author.bot) return;

    const threadAuthor = msg.member.displayName;
    const embeds = new MessageEmbed()
        .setColor('#FFE898')
        .setDescription(`Silahkan memberikan tanggapan dalam thread ini!`)
        .setFooter(`Thread dibuat secara otomatis`)
        .setTimestamp();

    msg.react('👍');
    msg.react('👎');
    msg.startThread({
        name: `Showcase Project dari ${threadAuthor}`,
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