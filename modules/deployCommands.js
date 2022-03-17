const fs = require('fs');
const path = require('path')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;

const deploy = async (client) => {
    try {
        const commands = [];
        const commandFiles = fs.readdirSync(path.join('__dirname', '/../commands')).filter(file => file.endsWith('.js'));

        const coms = [];

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            const json = command.command.toJSON();

            commands.push(json);

            json.permissions = command.command.permissions;
            coms.push(json);
        }

        const rest = new REST({ version: '9' }).setToken(TOKEN);

        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');

        console.log('Started adding application (/) commands permissions.');

        // Get commands
        const collection = await client.application.commands.fetch();

        collection.forEach(async (command) => {
            try {
                const com = coms.find(x => x.name === command.name);

                if(com) {
                    await client.application.commands.permissions.set({
                        command: command.id,
                        permissions: com.permissions
                    });
                }
            } catch (error) {
                console.error(error);
            }
        });

        console.log('Successfully adding application (/) commands permissions.');

    } catch (error) {
        console.error(error);
    }
};

module.exports = deploy;
