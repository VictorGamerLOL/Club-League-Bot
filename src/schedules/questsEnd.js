//The usual
const Discord = require("discord.js");
const logger = require("../utilities/logger.js");
const schedule = require("node-schedule");
const { guildId, pingRoleId, pingChannelId } = require("../../config.json");
const fs = require("fs");

module.exports = {
  name: "questEnd",
  description: "The job that acts at the end of club quests.",
  type: "quest",
  jobSchedule() {
    const rules = new schedule.RecurrenceRule();
    rules.dayOfWeek = 1;
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
      if (member[1].roles.cache.has(pingRoleId)) {
        member[1].roles.remove(pingRoleId);
      }
    }
    const message = await channel.messages.fetch(
      fs.readFileSync("./message.txt", "utf8")
    );
    message.delete();
  },
};
