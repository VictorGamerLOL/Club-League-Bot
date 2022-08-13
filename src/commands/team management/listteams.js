const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");

module.exports = {
  name: "listteams",
  description: "List all teams.",
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("listteams")
      .setDescription("List all teams.");
    return command.toJSON();
  },
  async execute(interaction) {
    await interaction.deferReply();
    let teams = await sql.listteams();
    let embed = new Discord.EmbedBuilder()
      .setTitle("Teams")
      .setDescription("Here's a list of all teams and their members.");
    for (let team of teams) {
      let members = [];
      if (
        team.user1 != "Nobody" ||
        team.user2 != "Nobody" ||
        team.user3 != "Nobody"
      ) {
        members = await Promise.all([
          sql.fetchMemberByTag(team.user1),
          sql.fetchMemberByTag(team.user2),
          sql.fetchMemberByTag(team.user3),
        ]);
        members[0] = Discord.escapeMarkdown(members[0].name);
        members[1] = Discord.escapeMarkdown(members[1].name);
        members[2] = Discord.escapeMarkdown(members[2].name);
      } else {
        members[0] = "Nobody";
        members[1] = "Nobody";
        members[2] = "Nobody";
      }
      embed.addFields({ name: team.name, value: members.join(", ") });
    }
    await interaction.deleteReply();
    await interaction.channel.send({
      content: "​", //Disregard the invisible character
      embeds: [embed],
    });
  },
};
