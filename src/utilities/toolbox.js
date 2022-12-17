const sql = require("./sqlHandler");
const dotenv = require("dotenv");
dotenv.config();
const GUILDID = process.env.GUILDID;
const brawl = require("./brawlApi");

module.exports = {
  /**
   *
   * @param {import("discord.js").Guild} guild
   * @param {import("discord.js").Snowflake} snowflake
   * @returns
   */
  checkIfMemberExists: async function (guild, snowflake) {
    try {
      let member = await guild.members.fetch(snowflake);
      return member;
    } catch (error) {
      return false;
    }
  },
  fixMembers: async function (client) {
    async function removeRole(snowflake) {
      if (!snowflake) return;
      let member = await checkIfMemberExists(guild, snowflake);
      if (member) await member.roles.remove(teamforreset.roleid);
    }
    let checkIfMemberExists = this.checkIfMemberExists;
    let issue = false;
    let guild = await client.guilds.fetch(GUILDID);
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
    for (let member of members) {
      //Add club members that are not in the database
      let result = dataMembers.findIndex((m) => {
        if (m.tag == member.tag) {
          if (m.name != member.name) {
            issue = true;
            sql.editMember(member.tag, member.name);
          }
          return true;
        }
        return false;
      });
      if (result == -1) {
        issue = true;
        await sql.addmember(member);
      }
    }
    for (let member of dataMembers) {
      //Remove club members in the database that are not in the club
      let result = members.findIndex((m) => {
        if (m.tag == member.tag) {
          return true;
        }
        return false;
      });
      if (result == -1) {
        issue = true;
        let teamforreset = await sql.fetchmemberteam(member.tag);
        let [teamMember1, teamMember2, teamMember3] = await Promise.all([
          sql.fetchMemberByTag(teamforreset.user1),
          sql.fetchMemberByTag(teamforreset.user2),
          sql.fetchMemberByTag(teamforreset.user3),
        ]);
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
      let memberInGuild = await checkIfMemberExists(guild, member.discordId);
      if (!memberInGuild) {
        issue = true;
        await sql.unbindMember(member.tag);
      }
    }
    if (issue) {
      return true;
    } else {
      return false;
    }
  },
};
