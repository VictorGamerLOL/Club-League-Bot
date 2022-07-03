const Discord = require("discord.js");
const logger = require("../../utilities/logger");
const schedule = require("node-schedule");
const sql = require("../../utilities/sqlHandler.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "toggleweek",
  description: "Toggles the week type between league and quest manually",
  permissionRequirements: ["Administrator"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("toggleweek")
      .setDescription(
        "Toggles the week type between league and quest manually"
      );
    return command.toJSON();
  },
  async execute(interaction) {
    await interaction.deferReply();
    await this.weekToggle(interaction.client);
    const state = await sql.getState("weekType");

    interaction.editReply("I have changed the week type to " + state);
  },
  async weekToggle(client) {
    const state = await sql.getState("weekType");
    const weekToggleJob = new schedule.RecurrenceRule();
    weekToggleJob.dayOfWeek = 6;
    weekToggleJob.hour = 14;
    weekToggleJob.minute = 1;
    weekToggleJob.tz = "ETC/UTC";
    if (state == "league") {
      logger.info("Changing week type to 'quest'");
      await sql.setState("weekType", "quest");
      schedule.gracefulShutdown();
      logger.info("Terminated current jobs");
      await this.scheduler(client);
      schedule.scheduleJob(weekToggleJob, this.weekToggle);
      logger.info("Successfully changed week type to 'quest'");
    }
    if (state == "quest") {
      logger.info("Changing week type to 'league'");
      await sql.setState("weekType", "league");
      schedule.gracefulShutdown();
      logger.info("Terminated current jobs");
      await this.scheduler(client);
      schedule.scheduleJob(weekToggleJob, this.weekToggle);
      logger.info("Successfully changed week type to 'league'");
    }
  },
  async scheduler(client) {
    const scheduleFiles = fs
      .readdirSync(path.join(__dirname, "../../schedules"))
      .filter((file) => file.endsWith(".js")); // same with commands but schedule handling
    const state = await sql.getState("weekType");
    for (const file of scheduleFiles) {
      const scheduleFile = require(path.join(
        __dirname,
        `../../schedules/${file}`
      ));
      if (scheduleFile.type != state) continue;
      schedule.scheduleJob(
        scheduleFile.jobSchedule(),
        scheduleFile.execute.bind({ client: client })
      );
      logger.info(`Scheduled ${scheduleFile.type} job:`, scheduleFile.name);
    }
    logger.info("Scheduled jobs");
  },
};
