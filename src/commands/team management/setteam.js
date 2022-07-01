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
  name: "setteam",
  description: "Assign 3 members to a teamname.",
  permissionRequirements: ["ManageGuild"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("setteam")
      .setDescription("Assign 3 members to a teamname.")
      .addUserOption((option) =>
        option
          .setName("member1")
          .setDescription("The first member of the teamname.")
          .setRequired(true)
      )
      .addUserOption((option) =>
        option
          .setName("member2")
          .setDescription("The second member of the teamname.")
          .setRequired(true)
      )
      .addUserOption((option) =>
        option
          .setName("member3")
          .setDescription("The third member of the teamname.")
          .setRequired(true)
      );
    return command.toJSON();
  },
  async execute(interaction) {
    await interaction.deferReply();
    member1 = await interaction.options.getUser("member1");
    member2 = await interaction.options.getUser("member2");
    member3 = await interaction.options.getUser("member3");
    timeSeed = Date.now();
    let teams = [];
    for (let teamname of await sql.fetchteams()) {
      teams.push(teamname.name);
    }
    const teamSelect = new Discord.SelectMenuBuilder()
      .setCustomId(`${timeSeed}teamSelect`)
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder("Team");
    for (let teamname of teams) {
      let option = new Discord.UnsafeSelectMenuOptionBuilder()
        .setLabel(teamname)
        .setValue(teamname)
        .setEmoji("⚫");
      teamSelect.addOptions(option.toJSON());
    }
    const actionRow = new Discord.ActionRowBuilder().addComponents([
      teamSelect,
    ]);
    await interaction.editReply({
      content: "Select the teamname for the 3 members.",
    });
    message = await interaction.channel.send({
      content: "​", //Disregard the invisible character
      components: [actionRow],
    });
    const filter = (interactionn) => {
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

    const guild = await interaction.client.guilds.fetch(guildId);

    const resetteam = async (teamObject) => {
      if (teamObject.name == "No Team") return;
      if (
        teamObject.user1 == "Nobody" ||
        teamObject.user2 == "Nobody" ||
        teamObject.user3 == "Nobody"
      )
        return;
      let user1 = await guild.members.fetch(teamObject.user1);
      let user2 = await guild.members.fetch(teamObject.user2);
      let user3 = await guild.members.fetch(teamObject.user3);
      await user1.roles.remove(teamObject.roleid);
      await user2.roles.remove(teamObject.roleid);
      await user3.roles.remove(teamObject.roleid);
      await sql.resetteam(teamObject.name);
    };

    const teamname = miniraction.values[0];
    member1 = await guild.members.fetch(member1.id);
    member2 = await guild.members.fetch(member2.id);
    member3 = await guild.members.fetch(member3.id);
    let teamforreset1 = await sql.fetchmemberteam(member1.id);
    await resetteam(teamforreset1);
    let teamforreset2 = await sql.fetchmemberteam(member2.id);
    await resetteam(teamforreset2);
    let teamforreset3 = await sql.fetchmemberteam(member3.id);
    await resetteam(teamforreset3);
    let teamforreset4 = await sql.fetchteam(teamname);
    await resetteam(teamforreset4);

    const team = await sql.fetchteam(teamname);
    if (team.name != "No Team") {
      await member1.roles.add(team.roleid);
      await member2.roles.add(team.roleid);
      await member3.roles.add(team.roleid);
    }
    await sql.setteam([member1.id, member2.id, member3.id], teamname);
    miniraction.editReply(
      `I have assigned the 3 members to the team ${teamname}.`
    );
  },
};
