require("dotenv").config();
const { Client, Intents } = require("discord.js");
const { Filters } = require("./modules/filters.js");
const { Public } = require("./modules/public.js");
const { Stickers } = require("./modules/stickers.js");
const main = () => {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    ],
  });

  client.on("ready", () => {
    console.info(`Logged in as ${client.user.tag}!`);
    console.info("Bot is ready!");
  });

  client.on("messageCreate", (msg) => {
    // Public Scope Command
    Public(msg, client);

    Stickers(msg, client);

    Filters(msg, client);
  });

  client.login(process.env.TOKEN);
};

main();
