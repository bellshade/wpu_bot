require("dotenv").config();
const { MessageEmbed, MessageAttachment } = require("discord.js");
const word = require("../data/filters.json");

const { sendMsg } = require("./utility.js");

const Filters = async (msg) => {
  const split = msg.content.split(/ +/);

  const filterEmbed = new MessageEmbed()
    .setColor("#992d22")
    .setAuthor(
      `${msg.author.username}`,
      `${msg.author.displayAvatarURL({ dynamic: true })}`
    )
    .setDescription(`**reply to:** ${msg.content}`);

  split.some((s) => {
    if (word[s.toLowerCase()]) {
      const attachment = new MessageAttachment(word[s]);
      sendMsg(msg.channel, { files: [attachment], embeds: [filterEmbed] });
      return true;
    }
  });
};

module.exports = {
  Filters,
};
