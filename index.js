require("dotenv").config();
const { Client, Intents, Collection } = require("discord.js");

const { PrismaClient }= require("@prisma/client");
const fs = require('fs');

const TOKEN = process.env.TOKEN;

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const options = {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES,
    ],
    allowedMentions: {
        parse: ["users", "roles"],
    },
};

const main = () => {
    const client = new Client(options);
    const prisma = new PrismaClient();

    client.prisma = prisma;
    client.commands = new Collection();

    // Register commands
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.command.name, command);
    }

    // Register events
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    // Login BOT
    client.login(TOKEN);
};

try {
    main();
} catch (error) {
    console.error(error);
}
