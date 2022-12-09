const Discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const GUILDID = process.env.GUILDID;
const PINGROLEID = process.env.PINGROLEID;

module.exports = {
  name: "giverole",
  description: "Give everyone on the server the club notification role.",
  permissionRequirements: ["ManageGuild"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("giverole")
      .setDescription(
        "Give everyone on the server the club notification role."
      );
    return command.toJSON();
  },
  /**
   * 
   * @param {Discord.ChatInputCommandInteraction} interaction 
   */
  async execute(interaction) {
    await interaction.deferReply();
    let members = await interaction.guild.members.fetch();
    let promisearray = [];
    for (let member of members) {
      if (!member[1].roles.cache.has(PINGROLEID)) {
        //Do not ask me why it starts at array index 1 for I do not know why :<
        promisearray.push(member[1].roles.add(PINGROLEID));
      }
    }
    await Promise.all(promisearray);
    interaction.editReply("I have given everyone the role.");
  },
};
