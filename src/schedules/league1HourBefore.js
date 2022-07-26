const schedule = require("node-schedule");
const { pingRoleId, pingChannelId } = require("../../config.json");
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
    const channel = await this.client.channels.fetch(pingChannelId);
    const message = await channel.send(
      `<@&${pingRoleId}>\n1 hour remains of club league.\nHave you done your club league?`
    );
    fs.writeFileSync("./message2.txt", message.id);
  },
};
