const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");

module.exports = {
  name: "not",
  description: "List all members that are not in a team and that do not have a discord bound to them.",
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("not")
      .setDescription("List all members that are not in a team/not have a discord bound to them.");
    return command.toJSON();
  },
  async execute(interaction) {
    await interaction.deferReply();
    let members = await sql.fetchAllMembers();
    let noTeam = ``;
    let noDiscord = ``;
    let embed = new Discord.EmbedBuilder()
      .setTitle("Members not in a team/not bound to a discord account.")
      .setDescription("Here's a list of all members that are not in a team/not bound to a discord account.");
    for (let member of members) {
      if (member.discordId == null) {
        noDiscord += `${Discord.escapeMarkdown(member.name)}, `;
      }
      if (member.team == "No Team") {
        noTeam += `${Discord.escapeMarkdown(member.name)}, `;
      }
    }
    if (noDiscord != "") embed.addFields({ name: "Members not bound to a discord account", value: noDiscord });
    if (noTeam != "") embed.addFields({ name: "Members not in a team", value: noTeam });
    await interaction.deleteReply();
    await interaction.channel.send({
      content: "​", //Disregard the invisible character
      embeds: [embed],
    });
  }
}