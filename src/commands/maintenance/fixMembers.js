const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");
const { guildId } = require("../../../config.json");
const brawl = require("../../utilities/brawlApi");
const utils = require("../../utilities/toolbox");

module.exports = {
  name: "fixmembers",
  description: "Fixes the database with members.",
  permissionRequirements: ["ManageGuild"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("fixmembers")
      .setDescription(
        "Fixes the database that holds the members of the guild."
      );
    return command.toJSON();
  },
  async execute(interaction) {
    let issue = false;
    await interaction.deferReply();
    let dataMembers = await sql.fetchAllMembers();
    let members = await brawl.getClubMembers();
    function compare(a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }
    dataMembers.sort(compare);
    members.sort(compare);
    for (let member of dataMembers) { //Add club members that are not in the database
      let result = members.findIndex((m) => {
        if (m.name == member.name) {
          return true;
        }
        return false;
      });
      if (result == -1) {
        issue = true;
        await sql.addmember(member);
      }
    }
    for (let member of members) { //Remove club members in the database that are not in the club
      let result = dataMembers.findIndex((m) => {
        if (m.name == member.name) {
          return true;
        }
        return false;
      }
      );
      if (result == -1) {
        issue = true;
        teamforreset = await sql.fetchmemberteam(member.name);
        let [teamMember1, teamMember2, teamMember3] = await Promise.all([
          sql.fetchMemberByTag(teamforreset.user1),
          sql.fetchMemberByTag(teamforreset.user2),
          sql.fetchMemberByTag(teamforreset.user3),
        ])
        async function removeRole (snowflake) {
          if (!snowflake) return;
          let member = await utils.checkIfMemberExists(interaction.guild, snowflake);
          if (member) await member.roles.remove(teamforreset.roleId);
        }
        await Promise.all([
          removeRole(teamMember1.discordId),
          removeRole(teamMember2.discordId),
          removeRole(teamMember3.discordId),
        ]);
        sql.resetteam(teamforreset.name);
        await sql.delmember(member.tag);
      }
    }
    dataMembers = await sql.fetchAllMembers();
    for (let member of dataMembers) {
      if (!member.discordId) continue;
      let memberInGuild = await utils.checkIfMemberExists(interaction.guild, member.discordId);
      if (!memberInGuild) {
        issue = true;
        await sql.unbindMember(member.tag);
      }
    }
    if (issue) {
      interaction.editReply("I have fixed the database.");
    } else {
      interaction.editReply("I have no issues.");
    }
  },
};
