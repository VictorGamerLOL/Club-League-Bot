const schedule = require("node-schedule");
const {
  guildId,
  pingRoleId,
  pingChannelId,
} = require("../../config.json");
const fs = require("fs");
const sql = require("../utilities/sqlHandler.js");

module.exports = {
  name: "leagueEnd",
  description: "The job that acts at the end of a league day.",
  type: "league",
  jobSchedule() {
    const rules = new schedule.RecurrenceRule();
    rules.dayOfWeek = [1, 4, 6];
    rules.hour = 14;
    rules.minute = 0;
    rules.tz = "Etc/UTC";
    return rules;
  },
  async execute() {
    const guild = await this.client.guilds.fetch(guildId);
    const channel = await this.client.channels.fetch(pingChannelId);
    const members = await guild.members.fetch();
    for (let member of members) {
      if (member[1].roles.cache.has(pingRoleId)) {
        //Do not ask me why it starts at array index 1 for I do not know why :<
        await member[1].roles.remove(pingRoleId);
      }
    }
    const message = await channel.messages.fetch(
      fs.readFileSync("./message.txt", "utf8")
    );
    message.delete();
    const message2 = await channel.messages.fetch(
      fs.readFileSync("./message2.txt", "utf8")
    );
    message2.delete();
  },
};
