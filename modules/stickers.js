require("dotenv").config();
const { MessageAttachment } = require("discord.js");
const data = require("../data/sticker.json");

const { deleteMsg, sendMsg } = require("./utility.js");

const Stickers = async (msg) => {
  const split = msg.content.split(/ +/);
  const command = split[0].toLowerCase();

  if (data[command]) {
    const attachment = new MessageAttachment(data[command]);

    // Send the attachment in the message channel
    sendMsg(msg.channel, { files: [attachment] });
    deleteMsg(msg);
  }
};

module.exports = {
  Stickers,
};
