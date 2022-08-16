const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");
const { guildId } = require("../../../config.json");
const brawl = require("../../utilities/brawlApi");
const utils = require("../../utilities/toolbox");

module.exports = {
  name: "fixmembers",
  description: "Fixes the database with members.",
  permissionRequirements: ["ManageGuild"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("fixmembers")
      .setDescription(
        "Fixes the database that holds the members of the guild."
      );
    return command.toJSON();
  },
  async execute(interaction) {
    let issue = false;
    await interaction.deferReply();
    issue = await utils.fixMembers(interaction.client)
    if (issue) {
      await interaction.editReply("I have fixed the database.");
    }
    else {
      await interaction.editReply("I have no issues with the database.");
    }
  },
};
