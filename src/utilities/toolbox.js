const Discord = require("discord.js");
const sql = require("./sqlHandler");
const { guildId } = require("../../config.json");
const brawl = require("./brawlApi");

module.exports = {
  checkIfMemberExists: async function (guild, snowflake) {
    try {
      let member = await guild.members.fetch(snowflake);
      return member;
    } catch (error) {
      return false;
    }
  }
}