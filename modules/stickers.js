const { MessageAttachment, MessageEmbed } = require('discord.js');
const data = require('../data/sticker.json');

const { deleteMsg, sendMsg } = require('./utility');

const WEBHOOK_ID = process.env.WEBHOOK_ID;

const Stickers = async (msg) => {
    try {
        const split = msg.content.split(/ +/);
        const command = split[0].toLowerCase();

        const author = msg.member;
        const guild = msg.guild;

        if (data[command]) {
            const attachment = new MessageAttachment(data[command]);
            const webhooks = await guild.fetchWebhooks();
            let webhook = webhooks.get(WEBHOOK_ID);
            let stickerEmbed = null;

            const stickerMsg = {
                files: [attachment],
                username: author.displayName,
                avatarURL: author.displayAvatarURL({ dynamic: true }),
            };

            if(msg.mentions && msg.mentions.repliedUser) {
                const referenceMessage = await msg.fetchReference();
                const member = referenceMessage.member;
                stickerEmbed = new MessageEmbed()
                    .setColor('#992d22')
                    .setAuthor({
                        name: `${member.displayName}`,
                        iconURL: `${member.displayAvatarURL({ dynamic: true })}`,
                    })
                    .setDescription(`**reply to:** ${referenceMessage.content}`);
                stickerMsg.embeds = [stickerEmbed];
            }

            await webhook.edit({
                channel: msg.channel,
                username: author.displayName,
                avatarURL: author.displayAvatarURL({ dynamic: true })
            });

            if(['oha'].includes(command)) {
                sendMsg(msg.channel, {files: [attachment]});
                deleteMsg(msg);
                return;
            }

            // Send the attachment in the message channel
            await webhook.send(stickerMsg);
            deleteMsg(msg);
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    Stickers,
};
