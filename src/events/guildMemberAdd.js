const sql = require("../utilities/sqlHandler");

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(GuildMember) {
    sql.addmember(GuildMember.id);
  },
};
