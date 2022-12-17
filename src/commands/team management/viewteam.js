const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");

module.exports = {
  name: "viewteam",
  description: "View the team and its members.",
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("viewteam")
      .setDescription("View the team and its members.");
    return command.toJSON();
  },
  /**
   *
   * @param {Discord.ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    timeSeed = Date.now();
    let teams = [];
    for (let teamname of await sql.fetchteams()) {
      if (teamname.name == "No Team") continue;
      teams.push(teamname.name);
    }
    if (teams[0] === undefined) {
      await interaction.editReply("There are no teams.");
      return;
    }
    const teamSelect = new Discord.SelectMenuBuilder()
      .setCustomId(`${timeSeed}teamSelect`)
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder("Team");
    for (let teamname of teams) {
      let option = new Discord.SelectMenuOptionBuilder()
        .setLabel(teamname)
        .setValue(teamname)
        .setEmoji("⚫");
      teamSelect.addOptions(option.toJSON());
    }
    const actionRow = new Discord.ActionRowBuilder().addComponents([
      teamSelect,
    ]);
    await interaction.editReply({
      content: "Select the team you want to view",
    });
    /**
     *
     * @type {Discord.Message}
     */
    let message = await interaction.channel.send({
      content: "​", //Disregard the invisible character
      components: [actionRow],
    });
    const filter = (
      /** @type {Discord.StringSelectMenuInteraction} */ interactionn
    ) => {
      if (
        interactionn.customId === `${timeSeed}teamSelect` &&
        interactionn.member.id == interaction.member.id
      )
        return true;
      return false;
    };
    try {
      var miniraction = await message.awaitMessageComponent({
        filter,
        time: 15000,
      });
    } catch {
      await message.edit({
        content: "Timed out",
        components: [],
      });
      interaction.deleteReply();
      return;
    }
    await miniraction.deferReply();
    const teamname = miniraction.values[0];
    let team = await sql.fetchteam(teamname);
    let teammembers = [];
    if (
      team.user1 == "Nobody" ||
      team.user2 == "Nobody" ||
      team.user3 == "Nobody"
    ) {
      await miniraction.editReply("This team is empty.");
      return;
    }
    teammembers = await Promise.all([
      sql.fetchMemberByTag(team.user1),
      sql.fetchMemberByTag(team.user2),
      sql.fetchMemberByTag(team.user3),
    ]);
    teammembers[0].name = Discord.escapeMarkdown(teammembers[0].name);
    teammembers[1].name = Discord.escapeMarkdown(teammembers[1].name);
    teammembers[2].name = Discord.escapeMarkdown(teammembers[2].name);
    function getMemberDiscord(member) {
      if (member.discordId) {
        return Discord.userMention(member.discordId);
      }
      return "N/A";
    }
    const embed = new Discord.EmbedBuilder()
      .setTitle(teamname)
      .setDescription(`Here are the details of team ***${teamname}***`)
      .addFields(
        { name: "Role", value: `<@&${team.roleid}>`, inline: false },
        { name: "Member 1", value: `${teammembers[0].name}`, inline: true },
        { name: "Member 2", value: `${teammembers[1].name}`, inline: true },
        { name: "Member 3", value: `${teammembers[2].name}`, inline: true },
        {
          name: "Member 1 Discord",
          value: `${getMemberDiscord(teammembers[0])}`,
          inline: true,
        },
        {
          name: "Member 2 Discord",
          value: `${getMemberDiscord(teammembers[1])}`,
          inline: true,
        },
        {
          name: "Member 3 Discord",
          value: `${getMemberDiscord(teammembers[2])}`,
          inline: true,
        }
      );
    miniraction.editReply({
      content: "​",
      embeds: [embed],
    });
  },
};
