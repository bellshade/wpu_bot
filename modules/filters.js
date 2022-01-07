const { MessageEmbed, MessageAttachment } = require('discord.js');
const word = require('../data/filters.json');

const { sendMsg } = require('./utility');

const Filters = async (msg) => {
    const split = msg.content.split(/ +/);

    const filterEmbed = new MessageEmbed()
        .setColor('#992d22')
        .setAuthor({
            name: `${msg.author.username}`,
            iconURL: `${msg.author.displayAvatarURL({ dynamic: true })}`,
        })
        .setDescription(`**reply to:** ${msg.content}`);

    split.some((s) => {
        if (word[s.toLowerCase()]) {
            const attachment = new MessageAttachment(word[s]);
            sendMsg(msg.channel, { files: [attachment], embeds: [filterEmbed] });
            return true;
        }
        return false;
    });
};

module.exports = {
    Filters,
};
