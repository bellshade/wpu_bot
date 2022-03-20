const cron = require('node-cron');
const deployCommands = require('../modules/deployCommands');
const pointAutomation = require('../modules/pointAutomation');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.info(`Logged in as ${client.user.tag}!`);
        console.info('Bot is ready!');

        deployCommands(client);

        cron.schedule('01 0 * * 1', () => {
            pointAutomation(client);
        });
    },
};
