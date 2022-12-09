const Discord = require("discord.js");
const sql = require("../../utilities/sqlHandler");
const brawl = require("../../utilities/brawlApi");

module.exports = {
  name: "bind",
  description: "Bind someone's Discord account to their Brawl Stars account.",
  permissionRequirements: ["ManageGuild"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("bind")
      .setDescription("Bind someone's Discord account to their Brawl Stars account.")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to bind.")
          .setRequired(true)
      )
    return command.toJSON();
  },
  /**
   * 
   * @param {Discord.ChatInputCommandInteraction} interaction 
   */
  async execute(interaction) {
    await interaction.deferReply();
    let user = interaction.options.getUser("user");
    let timeSeed = Date.now();
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
    members.sort(compare);
    let member = null
    try {
      member = await this.getMember(interaction, timeSeed, members);
    } catch {
      return
    }
    await sql.bindMember(member.member, user.id);
    await member.interaction.editReply("Member bound successfully.");
  },
  async getMember(interaction, timeSeed, members) {
    const member1Select = new Discord.SelectMenuBuilder()
      .setCustomId(`member1Select${timeSeed}`)
      .setPlaceholder(`Select the member.`)
      .setMinValues(1)
      .setMaxValues(1);
    for (let i = 0; i < 15; i++) {
      let member = members[i];
      let option = new Discord.SelectMenuOptionBuilder()
        .setLabel(member.name)
        .setValue(member.tag)
        .setEmoji("👤");
      member1Select.addOptions(option.toJSON());
    }
    const member2Select = new Discord.SelectMenuBuilder()
      .setCustomId(`member2Select${timeSeed}`)
      .setPlaceholder(`Select the member.`)
      .setMinValues(1)
      .setMaxValues(1);
    for (let i = 15; i < members.length; i++) {
      let member = members[i];
      let option = new Discord.SelectMenuOptionBuilder()
        .setLabel(member.name)
        .setValue(member.tag)
        .setEmoji("👤");
      member2Select.addOptions(option.toJSON());
    }
    let actionRowMember1 = new Discord.ActionRowBuilder().addComponents([
      member1Select,
    ]);
    let actionRowMember2 = new Discord.ActionRowBuilder().addComponents([
      member2Select,
    ]);
    await interaction.editReply({
      content: `Select the member. Each select menu has one half of the club in alphabetical order.`,
    });
    const filterMember = (i) => {
      if (
        (i.customId === `member1Select${timeSeed}` ||
          i.customId === `member2Select${timeSeed}`) &&
        interaction.user.id === interaction.user.id
      ) {
        return true;
      }
      return false;
    };
    let messageMember = await interaction.channel.send({
      content: "​", //Disregard the invisible character
      components: [actionRowMember1, actionRowMember2],
    });
    let interMember = undefined;
    try {
      interMember = await messageMember.awaitMessageComponent({
        filter: filterMember,
        time: 15000,
      });
    } catch {
      await messageMember.edit({
        content: "Timed out.",
        components: [],
      });
      interaction.deleteReply();
      throw "1";
    }
    const member = interMember.values[0];
    await interMember.deferReply();
    delete {
      messageMember,
      actionRowMember1,
      member1Select,
      actionRowMember2,
      member2Select,
      filterMember,
    };
    return { interaction: interMember, member: member };
  },
}