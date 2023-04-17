const logger = require("./logger");
const schedule = require("node-schedule");
const fs = require("fs");
const sql = require("./sqlHandler.js");
const path = require("path");
const { Client } = require("discord.js");

const scheduleFiles = fs
  .readdirSync(path.join(__dirname, "../schedules"))
  .filter((file) => file.endsWith(".js")); // same with commands but schedule handling

/**
 *
 * @param {Client} client
 */

async function scheduler(client) {
  await sql.init();
  const state = await sql.getState("weekType");
  for (const file of scheduleFiles) {
    const scheduleFile = require(path.join(__dirname, `../schedules/${file}`));
    if (scheduleFile.type != state && scheduleFile.type != "any") continue;
    schedule.scheduleJob(
      scheduleFile.jobSchedule(),
      scheduleFile.execute.bind({ client: client })
    );
    logger.info(`Scheduled ${scheduleFile.type} job:`, scheduleFile.name);
  }
  logger.info("Scheduled jobs");
}
exports.scheduler = scheduler;
