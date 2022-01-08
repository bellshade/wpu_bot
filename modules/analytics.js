const Analytics = async (msg, client, prisma) => {
    if(msg.content != null && msg.author.bot === false) {
        await prisma.messages.create({
            data: {
                author_id: msg.author.id,
                channel_id: msg.channelId,
                message_id: msg.id,
                messages: msg.content,
                attachments: JSON.stringify(msg.attachments)
            },
        });
    }
};

module.exports = {
    Analytics
};