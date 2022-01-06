require('dotenv').config();
const Discord = require('discord.js');
const Fuse = require('fuse.js');

const { embedError, getUserFromMention, checkRoles, deleteMsg, sendMsg} = require('./utility.js');

const Analytics = async (msg, client, prisma) => {
    const split = msg.content.split(/\n/gm);

    if(msg.content != null && msg.author.bot === false){
        await prisma.messages.create({
            data: {
                author_id: msg.author.id,
                channel_id: msg.channelId,
                message_id: msg.id,
                messages: msg.content,
                attachments: JSON.stringify(msg.attachments)
            },
        })
    }

    if(msg.channelId !== process.env.CHANNEL_PERKENALAN && split.length !== 7 || msg.author.bot === true){
        return;
    }

    if(split[0].includes('Siapa nama kamu?') && split[1].includes('Asal dari mana?') && split[2].includes('Sekolah / Kuliah di mana?') && split[3].includes('Bekerja di mana?') && split[4].includes('Dari mana tau WPU?') && split[5].includes('Bahasa pemrograman favorit?') && split[6].includes('Hobby / Interest?')){
        await prisma.perkenalan.create({
            data: {
                author_id: msg.author.id,
                channel_id: msg.channelId,
                message_id: msg.id,
                message_content: msg.content,
                nama: split[0].replace('Siapa nama kamu?', ' ').trim(),
                asal: split[1].replace('Asal dari mana?', ' ').trim(),
                sekolah: split[2].replace('Sekolah / Kuliah di mana?', ' ').trim(),
                bekerja: split[3].replace('Bekerja di mana?', ' ').trim(),
                referal: split[4].replace('Dari mana tau WPU?', ' ').trim(),
                favorite_programing_language: split[5].replace('Bahasa pemrograman favorit?', ' ').trim(),
                hobby: split[6].replace('Hobby / Interest?', ' ').trim()
            },
        })
    }
};

module.exports = {
    Analytics
};