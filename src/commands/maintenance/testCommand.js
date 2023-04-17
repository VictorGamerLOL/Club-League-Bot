const Discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
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
  /**
   *
   * @param {Discord.ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    let result = await utils.checkIfMemberExists(
      interaction.guild,
      "123456789"
    );
    interaction.editReply(`Result: ${result}`);
  },
};
