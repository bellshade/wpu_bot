require("dotenv").config();
const { Client, Intents } = require("discord.js");
const { Analytics } = require("./modules/analytics.js");
const { Filters } = require("./modules/filters.js");
const { Public } = require("./modules/public.js");
const { Stickers } = require("./modules/stickers.js");
const { Timeout } = require("./modules/timeout.js");
const { PrismaClient }= require("@prisma/client");

const intent = {
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  ],
};

const main = () => {
  const prisma = new PrismaClient();
  const client = new Client(intent);

  client.on("ready", () => {
    console.info(`Logged in as ${client.user.tag}!`);
    console.info("Bot is ready!");
  });

  client.on("messageCreate", (msg) => {
    // Public Scope Command
    Public(msg, client);

    Stickers(msg, client);

    Filters(msg, client);

    Timeout(msg, client);

    Analytics(msg, client, prisma)
  });

  client.login(process.env.TOKEN);
};

main();
