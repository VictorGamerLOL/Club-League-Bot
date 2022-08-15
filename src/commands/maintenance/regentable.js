const Discord = require("discord.js");
const { guildId } = require("../../../config.json");
const sql = require("../../utilities/sqlHandler");

module.exports = {
  name: "regentable",
  description: "Regenerate the tables.",
  permissionRequirements: ["Administrator"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("regentable")
      .setDescription("Regenerate the user tables upon joining a new server.");
    return command.toJSON();
  },
  async execute(interaction) {
    await interaction.deferReply();
    await sql.regentables();
    interaction.editReply("I have regenerated the tables.");
  },
};
