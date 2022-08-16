const utils = require('../utilities/toolbox.js');
const schedule = require('node-schedule');

module.exports = {
  name: "fixmembers",
  description: "Fixes the database with members.",
  type: "any",
  jobSchedule() {
    const rules = new schedule.RecurrenceRule();
    rules.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
    rules.hour = 11;
    rules.minute = 0;
    rules.tz = "Etc/UTC";
    return rules;
  },
  async execute() {
    await utils.fixMembers(this.client);
  }
}