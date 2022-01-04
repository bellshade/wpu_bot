require("dotenv").config();
const { MessageEmbed } = require("discord.js");

const { checkRoles, sendMsg } = require("./utility.js");

const Timeout = async (msg) => {
  const split = msg.content.split(/ +/);
  const command = split[0].toLowerCase();
  const args = split.slice(1);

  if (msg.author.bot) return;
  if (command === `${process.env.PREFIX}timeout`) {
    if (!checkRoles(msg)) return;

    let userId;
    let user = msg.mentions.users.first();

    if (!user) {
      const splitted = msg.content.trim().split(" ");
      userId = splitted[1];

      if (!userId) {
        userId = msg.author.id;
      }
    } else {
      userId = user.id;
    }

    let member;

    try {
      member = await msg.guild.members.fetch(userId);
    } catch (error) {
      return msg.reply(":x: User not found");
    }

    if (!args.length) {
      return msg.reply("Please mention the user & set the time");
    }

    if (args.length < 2) {
      return msg.reply("Please set the time");
    }

    const dur = args[1];

    const duration = parseInt(dur.slice(0, -1));
    const unit = dur[dur.length - 1];

    let time = new Date().getTime();

    switch (unit) {
      case "s":
        time = duration * 1000;
        break;

      case "m":
        time = duration * 1000 * 60;
        break;

      case "h":
        time = duration * 1000 * 60 * 60;
        break;

      case "d":
        time = duration * 1000 * 60 * 60 * 24;
        break;
    }

    const reason = args.slice(2).join(" ") || "";

    const timeoutEmbed = new MessageEmbed()
      .setColor("#992d22")
      .setDescription(`<@${member.id}> has been timeout`);

    member.timeout(time, reason).catch((err) => {
      if ((err = 50035)) {
        msg.reply("Maximal timeout is 28d");
      }
    });

    if (time < 2419200001) {
      sendMsg(msg.channel, { embeds: [timeoutEmbed] });
    }
  }
};

module.exports = {
  Timeout,
};
