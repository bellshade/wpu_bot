const data = require('../data/tag.json');

const { sendMsg } = require('./utility');

const Tag = async (msg) => {
    try {
        const split = msg.content.split(/ +/);
        const tag = split[1]?.toLowerCase();
        console.log(process.env.PREFIX);
        console.log(tag);
        console.log(split[0].toLowerCase() == process.env.PREFIX + 'wpu');
        if(split[0].toLowerCase() == process.env.PREFIX + 'wpu' && data[tag] && tag) {
            const ref = msg.reference?.messageId;
            if(ref) {
                const m = await msg.channel.messages.fetch(ref);
                m.reply(data[tag]);
                return;
            }
            sendMsg(msg.channel, data[tag]);
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    Tag,
};
