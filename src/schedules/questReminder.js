// The usual
const Discord = require("discord.js");
const logger = require("../utilities/logger.js");
const schedule = require("node-schedule");
const { guildId, pingRoleId, pingChannelId } = require("../../config.json");
const fs = require("fs");

module.exports = {
  name: "questReminder",
  description: "The job that acts at the start of a club quest day.",
  type: "quest",
  jobSchedule() {
    const rules = new schedule.RecurrenceRule();
    rules.dayOfWeek = 3;
    rules.hour = 14;
    rules.minute = 0;
    rules.tz = "Etc/UTC";
    return rules;
  },
  async execute() {
    const [guild, channel] = await Promise.all([
      this.client.guilds.fetch(guildId),
      this.client.channels.fetch(pingChannelId),
    ]);
    const members = await guild.members.fetch();
    for (let member of members) {
      if (!member[1].roles.cache.has(pingRoleId)) {
        //Do not ask me why it starts at array index 1 for I do not know why :<
        await member[1].roles.add(pingRoleId);
      }
    }
    let yes = new Discord.ButtonBuilder()
      .setCustomId("yes")
      .setLabel("Yes")
      .setStyle(Discord.ButtonStyle.Success);
    let no = new Discord.ButtonBuilder()
      .setCustomId("no")
      .setLabel("No")
      .setStyle(Discord.ButtonStyle.Danger);
    let row = new Discord.ActionRowBuilder().addComponents([yes, no]);
    const message = await channel.send({
      content: `<@&${pingRoleId}>\nThis is your reminder to do club quests.\nHave you done your club quests? (This means all 3)`,
      components: [row],
    });
    logger.info(`Message sent: ${message.id}`);
    fs.writeFileSync("./message.txt", message.id);
  },
};
