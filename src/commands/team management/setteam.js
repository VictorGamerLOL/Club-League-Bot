const Discord = require('discord.js')
const { guildId, token, clientId, pingRoleId, pingChannelId, logChannelId } = require('../../../config.json');
const sql = require('../../utilities/sqlHandler');

module.exports = {
    name: 'setteam',
    description: 'Assign 3 members to a team.',
    slashBuilder () {
        const command = new Discord.SlashCommandBuilder()
            .setName('setteam')
            .setDescription('Assign 3 members to a team.')
            .addUserOption(option =>
                option.setName('member1')
                    .setDescription('The first member of the team.')
                    .setRequired(true)
            )
            .addUserOption(option =>
                option.setName('member2')
                    .setDescription('The second member of the team.')
                    .setRequired(true)
            )
            .addUserOption(option =>
                option.setName('member3')
                    .setDescription('The third member of the team.')
                    .setRequired(true)
            )
        return command.toJSON()
    },
    async execute (interaction) {
        await interaction.deferReply()
        member1 = await interaction.options.getUser('member1')
        member2 = await interaction.options.getUser('member2')
        member3 = await interaction.options.getUser('member3')
        timeSeed = Date.now()
        let teams = []
        for (let team of await sql.fetchteams()) {
            teams.push(team.name)
        }
        const teamSelect = new Discord.SelectMenuBuilder()
            .setCustomId(`${timeSeed}teamSelect`)
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Team")
        for (let teamname of teams) {
            let option = new Discord.UnsafeSelectMenuOptionBuilder()
                .setLabel(teamname)
                .setValue(teamname)
                .setEmoji('🏁')
            teamSelect.addOptions(option.toJSON())
        }
        const actionRow = new Discord.ActionRowBuilder()
            .addComponents([teamSelect])
        await interaction.editReply({
            content: "Select the team for the 3 members.",
        })
        message = await interaction.channel.send({
            content: "​", //Disregard the invisible character
            components: [actionRow]
        })
        const filter = (interactionn) => {
            if (interactionn.customId === `${timeSeed}teamSelect` && interactionn.member.id == interaction.member.id) return true
            return false
        }
        let miniraction = await message.awaitMessageComponent({filter, time: 15000})
        await miniraction.deferReply()
        let team = miniraction.values[0]
        await sql.resetteam(team)
        await sql.setteam([member1.id, member2.id, member3.id], team)
        const teamrecord = await sql.fetchteam(team)
        const role = teamrecord.roleid
        let guild = await interaction.client.guilds.fetch(guildId)
        member1 = await guild.members.fetch(member1.id)
        member2 = await guild.members.fetch(member2.id)
        member3 = await guild.members.fetch(member3.id)
        member1.roles.add(role)
        member2.roles.add(role)
        member3.roles.add(role)
        await miniraction.editReply(`The members have been assigned to ${team}`)
    }
}