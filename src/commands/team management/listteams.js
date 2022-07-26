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
      if (
        team.user1 != "Nobody" ||
        team.user2 != "Nobody" ||
        team.user3 != "Nobody"
      ) {
        try {
          //Self-fixing mechanism for when the guildMemberRemove event fails
          var [member1, member2, member3] = await Promise.all([
            interaction.guild.members.fetch(team.user1),
            interaction.guild.members.fetch(team.user2),
            interaction.guild.members.fetch(team.user3),
          ]);
        } catch {
          for (let i = 1; i < 4; i++) {
            try {
              await interaction.guild.members.fetch(team[`user${i}`]);
            } catch {
              let fakeguildmember = await interaction.client.users.fetch(
                team[`user${i}`]
              );
              fakeguildmember.guild = interaction.guild;
              const guildMemberRemove = require("../../events/guildMemberRemove"); //reduce, reuse, recycle
              await guildMemberRemove.execute(fakeguildmember);
            }
          }
          var member1 = { displayName: "Nobody" };
          var member2 = { displayName: "Nobody" };
          var member3 = { displayName: "Nobody" };
        }
      } else {
        var member1 = { displayName: "Nobody" };
        var member2 = { displayName: "Nobody" };
        var member3 = { displayName: "Nobody" };
      }
      const members = [
        member1.displayName,
        member2.displayName,
        member3.displayName,
      ];
      embed.addFields({ name: team.name, value: members.join(", ") });
    }
    await interaction.deleteReply();
    await interaction.channel.send({
      content: "​", //Disregard the invisible character
      embeds: [embed],
    });
  },
};
