module.exports = {
    name: 'ready',
    once: false,
    execute(client) {
        console.info(`Logged in as ${client.user.tag}!`);
        console.info("Bot is ready!");
    },
};
