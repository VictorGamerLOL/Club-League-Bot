const Discord = require("discord.js");
const schedule = require("node-schedule");
const dotenv = require("dotenv");
dotenv.config();
const GUILDID = process.env.GUILDID;
const PINGROLEID = process.env.PINGROLEID;
const PINGCHANNELID = process.env.PINGCHANNELID;
const fs = require("fs");
const sql = require("../utilities/sqlHandler.js");

module.exports = {
  name: "leagueStart",
  description: "The job that acts at the start of a league day.",
  type: "league",
  jobSchedule() {
    const rules = new schedule.RecurrenceRule();
    rules.dayOfWeek = [0, 3, 5];
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
      if (!member[1].roles.cache.has(PINGROLEID)) {
        //Do not ask me why it starts at array index 1 for I do not know why :<
        await member[1].roles.add(PINGROLEID);
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
      content: `<@&${PINGROLEID}>\nA new day of Club league has started.\nHave you done your club league?`,
      components: [row],
    });
    fs.writeFileSync("./message.txt", message.id);
  },
};
