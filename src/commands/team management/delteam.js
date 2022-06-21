//The usual imports
const Discord = require('discord.js')
const { guildId, token, clientId, pingRoleId, pingChannelId} = require('../../../config.json')
const sql = require('../../utilities/sqlHandler')

//The module.exports
module.exports = {
    name: 'delteam',
    description: 'Delete a team.',
    permissionRequirements: ['ManageGuild'],
    slashBuilder () {
        const command = new Discord.SlashCommandBuilder()
            .setName('delteam')
            .setDescription('Delete a team.')
        return command.toJSON()
    },
    async execute (interaction) {
        await interaction.deferReply()
        timeSeed = Date.now()
        let teams = []
        for (let teamname of await sql.fetchteams()) {
            if (teamname.name == "No Team") continue
            teams.push(teamname.name)
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
                .setEmoji('⚫')
            teamSelect.addOptions(option.toJSON())
        }
        const actionRow = new Discord.ActionRowBuilder()
            .addComponents([teamSelect])
        await interaction.editReply({
            content: "Select the team you want to delete.",
        })
        message = await interaction.channel.send({
            content: "​", //Disregard the invisible character
            components: [actionRow]
        })
        const filter = (interactionn) => {
            if (interactionn.customId === `${timeSeed}teamSelect` && interactionn.member.id == interaction.member.id) return true
            return false
        }
        try {
            let miniraction = await message.awaitMessageComponent({filter, time: 15000})
        } catch {
            await message.edit({
                content: "Timed out",
                components: []
            })
            interaction.deleteReply()
            return
        }
        await miniraction.deferReply()
        const teamname = miniraction.values[0]
        let team = await sql.fetchteam(teamname)
        let teammembers = await sql.fetchteammembers(teamname)
        for (let user in teammembers) {
            if (teammembers[user] == "Nobody") continue
            let member = await interaction.guild.members.fetch(teammembers[user])
            await member.roles.remove(team.roleid)
        }
        await sql.delteam(teamname)
        await miniraction.editReply("Team deleted.")
    }
}