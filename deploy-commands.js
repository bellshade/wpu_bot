require('dotenv').config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;

const deploy = async () => {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        const com = command.command;

        commands.push(com.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        const res = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');

        return res;
    } catch (error) {
        console.error(error);
        return false;
    }
};

deploy();