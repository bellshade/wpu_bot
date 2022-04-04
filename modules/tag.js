require('dotenv').config();
const data = require('../data/tag.json');

const { sendMsg } = require('./utility');
const session = [];

const Tag = async (msg) => {
    try {
        const split = msg.content.split(/ +/);
        const tag = split[1]?.toLowerCase();
        if(!split[0].toLowerCase() == process.env.PREFIX + 'wpu') return;
        if(data[tag] && tag) {
            if(!checkSession(msg)) return;
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

const checkSession = (msg) => {
    const index = session.findIndex(s => s.id == msg.author.id);
    const timeout = session[index]?.time - Date.now();
    if(timeout > 0) return false; // cannot use command
    session.splice(index, 1);
    session.push({ id: msg.author.id, time: Date.now() + 30000 }); // 30 seconds timeout
    return true;
};

module.exports = {
    Tag,
};
