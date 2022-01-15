const { Join } = require('../modules/perkenalan');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute(guildMember) {
        const client = guildMember.client;

        Join(guildMember, client);
    },
};