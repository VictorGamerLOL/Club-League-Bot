const Discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const GUILDID = process.env.GUILDID;
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
  /**
   * 
   * @param {Discord.ChatInputCommandInteraction} interaction 
   */
  async execute(interaction) {
    await interaction.deferReply();
    await sql.regentables();
    interaction.editReply("I have regenerated the tables.");
  },
};
