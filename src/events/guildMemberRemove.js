const sql = require("../utilities/sqlHandler");

module.exports = {
  name: "guildMemberRemove",
  once: false,
  async execute(GuildMember) {
    const guild = GuildMember.guild;
    const resetteam = async (teamObject) => {
      console.log(teamObject);
      if (teamObject.name == "No Team") return;
      if (
        teamObject.user1 == "Nobody" ||
        teamObject.user2 == "Nobody" ||
        teamObject.user3 == "Nobody"
      )
        return;
      if (GuildMember.id != teamObject.user1) {
        let user1 = await guild.members.fetch(teamObject.user1);
        await user1.roles.remove(teamObject.roleid);
      }
      if (GuildMember.id != teamObject.user2) {
        let user2 = await guild.members.fetch(teamObject.user2);
        await user2.roles.remove(teamObject.roleid);
      }
      if (GuildMember.id != teamObject.user3) {
        let user3 = await guild.members.fetch(teamObject.user3);
        await user3.roles.remove(teamObject.roleid);
      }

      await sql.resetteam(teamObject.name);
    };
    let teamforreset = await sql.fetchmemberteam(GuildMember.id);
    await resetteam(teamforreset);
    await sql.delmember(GuildMember.id);
  },
};
