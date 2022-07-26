const Discord = require("discord.js");
const { guildId, pingRoleId } = require("../../../config.json");

module.exports = {
  name: "takerole",
  description:
    "Take away the club notification role from everyone on the server.",
  permissionRequirements: ["ManageGuild"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("takerole")
      .setDescription(
        "Take away the club notification role from everyone on the server."
      );
    return command.toJSON();
  },
  async execute(interaction) {
    await interaction.deferReply();
    let guild = await interaction.client.guilds.fetch(guildId);
    let members = await guild.members.fetch();
    let promisearray = [];
    for (let member of members) {
      if (member[1].roles.cache.has(pingRoleId)) {
        //Do not ask me why it starts at array index 1 for I do not know why :<
        promisearray.push(member[1].roles.remove(pingRoleId));
      }
    }
    await Promise.all(promisearray);
    interaction.editReply("I have taken away the role from everyone.");
  },
};
