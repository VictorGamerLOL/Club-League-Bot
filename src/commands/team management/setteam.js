const Discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const GUILDID = process.env.GUILDID;
const sql = require("../../utilities/sqlHandler");
const brawl = require("../../utilities/brawlApi");
const utils = require("../../utilities/toolbox");

module.exports = {
  name: "setteam",
  description: "Assign 3 members to a teamname.",
  permissionRequirements: ["ManageGuild"],
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName("setteam")
      .setDescription("Assign 3 members to a teamname.");
    return command.toJSON();
  },
  async execute(interaction) {
    await interaction.deferReply();
    let members = await sql.fetchAllMembers();
    if (members.length == 0) {
      await interaction.editReply("I have no members in my database.");
      return;
    }
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
    let teams = [];
    for (let team of await sql.fetchteams()) {
      teams.push(team.name);
    }
    const timeSeed = Date.now();
    let popname = "";
    const memberPopFilter = (m) => {
      if (m.tag == popname) return true;
      return false;
    };
    let member1 = null;
    let member2 = null;
    let member3 = null;
    try {
      //They could time out on any of the member popups
      member1 = await this.getMember(interaction, "first", timeSeed, members);
      popname = member1.member;
      let index = members.findIndex(memberPopFilter);
      members.splice(index, 1);
      member2 = await this.getMember(
        member1.interaction,
        "second",
        timeSeed,
        members
      );
      popname = member2.member;
      index = members.findIndex(memberPopFilter);
      members.splice(index, 1);
      member3 = await this.getMember(
        member2.interaction,
        "third",
        timeSeed,
        members
      );
      delete popname;
    } catch {
      return;
    }
    const teamSelect = new Discord.SelectMenuBuilder()
      .setCustomId(`${timeSeed}teamSelect`)
      .setPlaceholder("Select a team")
      .setMinValues(1)
      .setMaxValues(1);
    for (let team of teams) {
      let option = new Discord.SelectMenuOptionBuilder()
        .setLabel(team)
        .setValue(team)
        .setEmoji("⚫");
      teamSelect.addOptions(option);
    }
    let teamActionRow = new Discord.ActionRowBuilder().addComponents([
      teamSelect,
    ]);
    await member3.interaction.editReply("Select a team for the members.");
    const filterTeam = (t) => {
      if (
        t.customId == `${timeSeed}teamSelect` &&
        t.user.id == interaction.user.id
      )
        return true;
      return false;
    };
    let messageTeam = await member3.interaction.channel.send({
      content: "​", // Disregard invisible character
      components: [teamActionRow],
    });
    let interTeam = null;
    try {
      interTeam = await messageTeam.awaitMessageComponent({
        filter: filterTeam,
        time: 15000,
      });
    } catch (error) {
      await messageTeam.edit({
        content: "Timed out.",
        components: [],
      });
      return;
    }
    member1 = member1.member;
    member2 = member2.member;
    member3 = member3.member;
    await interTeam.deferReply();
    async function resetTeam(team) {
      let [member1, member2, member3] = await Promise.all([
        sql.fetchMemberByTag(team.user1),
        sql.fetchMemberByTag(team.user2),
        sql.fetchMemberByTag(team.user3),
      ]);
      if (member1.discordId) {
        let member1Discord = await utils.checkIfMemberExists(member1.discordId);
        if (member1Discord) await member1Discord.roles.remove(team.roleId);
      }
      if (member2.discordId) {
        let member2Discord = await utils.checkIfMemberExists(member2.discordId);
        if (member2Discord) await member2Discord.roles.remove(team.roleId);
      }
      if (member3.discordId) {
        let member3Discord = await utils.checkIfMemberExists(member3.discordId);
        if (member3Discord) await member3Discord.roles.remove(team.roleId);
      }
      await sql.resetteam(team.name);
    }
    let team = interTeam.values[0];
    member1 = await sql.fetchMemberByTag(member1);
    await resetTeam(await sql.fetchteam(member1.team));
    member2 = await sql.fetchMemberByTag(member2); //Need to do them in this order in case 2 or more
    await resetTeam(await sql.fetchteam(member2.team)); //members share a team
    member3 = await sql.fetchMemberByTag(member3);
    await resetTeam(await sql.fetchteam(member3.team));
    await resetTeam(await sql.fetchteam(team));
    await sql.setteam([member1.tag, member2.tag, member3.tag], team);
    team = await sql.fetchteam(team);
    async function giveRole(member, team) {
      if (team.name == "No Team") return;
      if (member.discordId) {
        let memberDiscord = await utils.checkIfMemberExists(interaction.guild, member.discordId);
        if (memberDiscord) await memberDiscord.roles.add(team.roleid);
      }
    }
    await Promise.all([
      giveRole(member1, team),
      giveRole(member2, team),
      giveRole(member3, team),
    ]);
    await interTeam.editReply(
      `Set the team of ${Discord.escapeMarkdown(
        member1.name
      )}, ${Discord.escapeMarkdown(member2.name)}, and ${Discord.escapeMarkdown(
        member3.name
      )} to ${team.name}.`
    );
  },

  async getMember(interaction, count, timeSeed, members) {
    const member1Select = new Discord.SelectMenuBuilder()
      .setCustomId(`member1Select${timeSeed}`)
      .setPlaceholder(`Select the ${count} member.`)
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
      .setPlaceholder(`Select the ${count} member.`)
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
      content: `Select the ${count} member. Each select menu has one half of the club in alphabetical order.`,
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
        time: 60000,
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
};
