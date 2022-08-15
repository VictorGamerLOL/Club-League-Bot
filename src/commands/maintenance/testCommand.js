const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");
const { guildId } = require("../../../config.json");
const brawl = require("../../utilities/brawlApi");
const utils = require("../../utilities/toolbox");

module.exports = {
  name: "test",
  description: "Test command.",
  permissionRequirements: ["Administrator"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("test")
      .setDescription("Test command.");
    return command.toJSON();
  },
  async execute(interaction) {
    await interaction.deferReply();
    let result = await utils.checkIfMemberExists(interaction.guild, "123456789");
    interaction.editReply(`Result: ${result}`);
  }
}