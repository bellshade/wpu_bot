require('dotenv').config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN;

const deploy = () => {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.command.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(TOKEN);

    rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
};

deploy();