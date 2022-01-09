require("dotenv").config();
const { Client, Intents } = require("discord.js");
const { Analytics } = require("./modules/analytics.js");
const { Filters } = require("./modules/filters.js");
const { Public } = require("./modules/public.js");
const { Stickers } = require("./modules/stickers.js");
const { Timeout } = require("./modules/timeout.js");
const { PrismaClient } = require("@prisma/client");
const { Join, Perkenalan } = require("./modules/perkenalan.js");
const { Info } = require("./modules/info.js");

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
    const prisma = new PrismaClient();
    const client = new Client(options);

    client.on("ready", () => {
        console.info(`Logged in as ${client.user.tag}!`);
        console.info("Bot is ready!");
    });

    client.on("messageCreate", (msg) => {
        Analytics(msg, client, prisma); // Always load this first

        Public(msg, client); // Public Scope Command

        Stickers(msg, client);

        Filters(msg, client);

        Timeout(msg, client);

        Perkenalan(msg, client, prisma);

        Info(msg, client);
    });

    client.on("guildMemberAdd", async (guildMember) => {
        Join(guildMember, client);
    });

    client.login(process.env.TOKEN);
};

main();
