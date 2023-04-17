const Discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const GUILDID = process.env.GUILDID;
const PINGROLEID = process.env.PINGROLEID;

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
  /**
   *
   * @param {Discord.ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    let guild = await interaction.client.guilds.fetch(GUILDID);
    let members = await guild.members.fetch();
    let promisearray = [];
    for (let member of members) {
      if (member[1].roles.cache.has(PINGROLEID)) {
        //Do not ask me why it starts at array index 1 for I do not know why :<
        promisearray.push(member[1].roles.remove(PINGROLEID));
      }
    }
    await Promise.all(promisearray);
    interaction.editReply("I have taken away the role from everyone.");
  },
};
