const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");
const utils = require("../../utilities/toolbox");

module.exports = {
  name: "not",
  description:
    "List all members that are not in a team, that do not have a discord bound to them and that are not in the club but are in the discord.",
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("not")
      .setDescription(
        "List all members that are not in a team/not have a discord bound to them/are not in club."
      );
    return command.toJSON();
  },
  /**
   *
   * @param {Discord.ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    await utils.fixMembers(interaction.client);
    let members = await sql.fetchAllMembers();
    let discordMembers = await interaction.guild.members.fetch();
    let noTeam = ``;
    let noDiscord = ``;
    let noClub = ``;
    let embed = new Discord.EmbedBuilder()
      .setTitle(
        "Members not in a team/not bound to a discord account/not in the club."
      )
      .setDescription(
        "Here's a list of all members that are not in a team/not bound to a discord account."
      );
    for (let member of members) {
      if (member.discordId == null) {
        noDiscord += `${Discord.escapeMarkdown(member.name)}, `;
      }
      if (member.team == "No Team") {
        noTeam += `${Discord.escapeMarkdown(member.name)}, `;
      }
      if (member.discordId != null) {
        discordMembers.delete(member.discordId);
      }
    }
    discordMembers.forEach((value) => {
      if (value.user.bot) {
        return;
      }
      noClub += `${value.user.username}#${value.user.discriminator}, `;
    });
    noTeam = noTeam.slice(0, -2);
    noDiscord = noDiscord.slice(0, -2);
    noClub = noClub.slice(0, -2);
    if (noDiscord != "")
      embed.addFields({
        name: "Members not bound to a discord account",
        value: noDiscord,
      });
    if (noTeam != "")
      embed.addFields({ name: "Members not in a team", value: noTeam });
    if (noClub != "")
      embed.addFields({ name: "Members not in the club", value: noClub });
    await interaction.deleteReply();
    await interaction.channel.send({
      content: "​", //Disregard the invisible character
      embeds: [embed],
    });
  },
};
