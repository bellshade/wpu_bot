const { MessageAttachment, MessageEmbed } = require('discord.js');
const data = require('../data/sticker.json');

const { deleteMsg, sendMsg } = require('./utility');

const Stickers = async (msg) => {
    const split = msg.content.split(/ +/);
    const command = split[0].toLowerCase();

    const stickerEmbed = new MessageEmbed()
        .setColor('#992d22')
        .setAuthor({
            name: `${msg.author.username}`,
            iconURL: `${msg.author.displayAvatarURL({ dynamic: true })}`,
        })
        .setDescription(`**reply to:** ${msg.content}`);

    if (data[command]) {
        const attachment = new MessageAttachment(data[command]);

        // Send the attachment in the message channel
        sendMsg(msg.channel, { files: [attachment], embeds: [stickerEmbed] });
        deleteMsg(msg);
    }
};

module.exports = {
    Stickers,
};
