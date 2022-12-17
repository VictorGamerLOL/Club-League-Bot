//The usual
const schedule = require("node-schedule");
const dotenv = require("dotenv");
dotenv.config();
const GUILDID = process.env.GUILDID;
const PINGROLEID = process.env.PINGROLEID;
const PINGCHANNELID = process.env.PINGCHANNELID;
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
      this.client.guilds.fetch(GUILDID),
      this.client.channels.fetch(PINGCHANNELID),
    ]);
    const members = await guild.members.fetch();
    for (let member of members) {
      if (member[1].roles.cache.has(PINGROLEID)) {
        member[1].roles.remove(PINGROLEID);
      }
    }
    const message = await channel.messages.fetch(
      fs.readFileSync("./message.txt", "utf8")
    );
    message.delete();
  },
};
