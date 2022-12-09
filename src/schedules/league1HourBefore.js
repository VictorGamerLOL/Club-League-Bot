const schedule = require("node-schedule");
const dotenv = require("dotenv");
dotenv.config();
const PINGROLEID = process.env.PINGROLEID;
const PINGCHANNELID = process.env.PINGCHANNELID;
const fs = require("fs");
const sql = require("../utilities/sqlHandler.js");

module.exports = {
  name: "league1HourBefore",
  description: "The job that acts 1 hour before the end of a league day.",
  type: "league",
  jobSchedule() {
    const rules = new schedule.RecurrenceRule();
    rules.dayOfWeek = [1, 4, 6];
    rules.hour = 13;
    rules.minute = 0;
    rules.tz = "Etc/UTC";
    return rules;
  },
  async execute() {
    const channel = await this.client.channels.fetch(PINGCHANNELID);
    const message = await channel.send(
      `<@&${PINGROLEID}>\n1 hour remains of club league.\nHave you done your club league?`
    );
    fs.writeFileSync("./message2.txt", message.id);
  },
};
