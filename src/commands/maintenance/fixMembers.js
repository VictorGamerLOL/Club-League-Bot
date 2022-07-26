const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");
const { guildId } = require("../../../config.json");

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
    for (let x of await sql.fetchAllMembers()) {
      try {
        await interaction.guild.members.fetch(x.id);
      } catch (e) {
        const guildMemberDelete = require("../../events/guildMemberDelete");
        fakeguildmember = await interaction.client.users.fetch(x.id);
        fakeguildmember.guild = interaction.guild;
        guildMemberDelete.execute(fakeguildmember);
        issue = true;
      }
    }
    for (let x of await interaction.guild.members.cache) {
      const result = await sql.fetchSingleMember(x[1].id);
      if (result === undefined) {
        sql.addmember(x[1].id);
        issue = true;
      }
    }
    if (issue) {
      interaction.editReply("I have fixed the database.");
    } else {
      interaction.editReply("I have no issues.");
    }
  },
};
