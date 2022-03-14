require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN;

const remove = () => {
    const rest = new REST({ version: '9' }).setToken(TOKEN);

    rest.get(Routes.applicationCommands(CLIENT_ID))
        .then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationCommands(CLIENT_ID)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises)
                .then(console.log('Successfully remove application commands.'))
                .catch(console.error);
        })
        .catch(console.error);
};

remove();