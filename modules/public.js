const Discord = require('discord.js');

const {
    embedError, checkRoles, deleteMsg, sendMsg,
} = require('./utility');

const Public = (msg) => {
    const split = msg.content.split(/ +/);
    const command = split[0].toLowerCase();
    const args = split.slice(1);

    if (command === 'u') {
        if (!checkRoles(msg)) return;
        let str = '';
        for (let i = 0; i < args.length; i++) {
            str += ` ${args[i]}`;
        }

        sendMsg(msg.channel, str);
        deleteMsg(msg);
    }

    if (command === 'attach') {
        if (!args[0]) return;
        const attachment = new Discord.MessageAttachment(args[0]);
        // Send the attachment in the message channel

        try {
            msg.channel.send({ files: [attachment] });
        } catch (error) {
            msg.channel.send({ embed: [embedError(error)] });
        }

        deleteMsg(msg);
    }
};

module.exports = {
    Public,
};
