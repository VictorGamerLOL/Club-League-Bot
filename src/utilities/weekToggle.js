const logger = require("./logger");
const schedule = require("node-schedule");
const sql = require("./sqlHandler.js");

/**
 *
 * @param {() => Promise<void>} scheduler
 * @param {schedule.RecurrenceRule} weekToggleJob
 */
const weekToggle = async (scheduler, weekToggleJob) => {
  const state = await sql.getState("weekType");
  if (state == "league") {
    logger.info("Changing week type to 'quest'");
    await sql.setState("weekType", "quest");
    schedule.gracefulShutdown();
    logger.info("Terminated current jobs");
    await scheduler();
    schedule.scheduleJob(
      weekToggleJob,
      weekToggle.bind(undefined, scheduler, weekToggleJob)
    );
    logger.info("Successfully changed week type to 'quest'");
  }
  if (state == "quest") {
    logger.info("Changing week type to 'league'");
    await sql.setState("weekType", "league");
    schedule.gracefulShutdown();
    logger.info("Terminated current jobs");
    await scheduler();
    schedule.scheduleJob(
      weekToggleJob,
      weekToggle.bind(undefined, scheduler, weekToggleJob)
    );
    logger.info("Successfully changed week type to 'league'");
  }
};
exports.weekToggle = weekToggle;
