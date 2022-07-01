const Discord = require("discord.js");
const {
  guildId,
  token,
  clientId,
  pingRoleId,
  pingChannelId,
} = require("../../../config.json");
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
    let guild = await interaction.client.guilds.fetch(guildId);
    let members = await guild.members.fetch();
    membersList = [];
    for (let member of members) {
      console.log(member[1].user);
      if (member[1].user.bot) continue;
      membersList.push(member[1].user.id);
    }
    sql.regentables(membersList);
    interaction.editReply("I have regenerated the tables.");
  },
};
