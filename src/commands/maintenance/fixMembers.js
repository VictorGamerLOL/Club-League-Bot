const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");
const { guildId } = require("../../../config.json");
const brawl = require("../../utilities/brawlApi");

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
        sql.resetteam(teamforreset.name);
        await sql.delmember(member.tag);
      }
    }
    if (issue) {
      interaction.editReply("I have fixed the database.");
    } else {
      interaction.editReply("I have no issues.");
    }
  },
};
