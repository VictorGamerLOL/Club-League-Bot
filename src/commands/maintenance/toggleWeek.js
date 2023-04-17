const Discord = require("discord.js");
const schedule = require("node-schedule");
const sql = require("../../utilities/sqlHandler.js");
const weekToggle = require("../../utilities/weekToggle.js");
const scheduler = require("../../utilities/scheduler.js");

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
  /**
   *
   * @param {Discord.ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    await this.weekToggler(interaction.client);
    const state = await sql.getState("weekType");

    interaction.editReply("I have changed the week type to " + state);
  },
  /**
   *
   * @param {Discord.Client} client
   */
  async weekToggler(client) {
    const state = await sql.getState("weekType");
    const weekToggleJob = new schedule.RecurrenceRule();
    weekToggleJob.dayOfWeek = 1;
    weekToggleJob.hour = 14;
    weekToggleJob.minute = 1;
    weekToggleJob.tz = "ETC/UTC";
    await weekToggle.weekToggle(
      scheduler.scheduler.bind(undefined, client),
      weekToggleJob
    );
  },
};
