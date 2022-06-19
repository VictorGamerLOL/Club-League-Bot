const Discord = require('discord.js')
const { guildId, token, clientId, pingRoleId, pingChannelId, logChannelId } = require('../../../config.json')
const sql = require('../../utilities/sqlHandler')

module.exports = {
    name: 'viewteam',
    description: 'View the team and its members.',
    slashBuilder () {
        const command = new Discord.SlashCommandBuilder()
            .setName('viewteam')
            .setDescription('View the team and its members.')
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
        if (teams[0] === undefined) {
            await interaction.editReply("There are no teams.")
            return
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
            content: "Select the team you want to view",
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
        const teamname = miniraction.values[0]
        let team = await sql.fetchteam(teamname)
        const embed = new Discord.EmbedBuilder()
            .setTitle(teamname)
            .setDescription(`Here are the details of team ***${teamname}***`)
            .addFields(
                {name: "Role", value: `<@&${team.roleid}>`, inline: false},
                {name: "Member 1", value: `<@${team.user1}>`, inline: true},
                {name: "Member 2", value: `<@${team.user2}>`, inline: true},
                {name: "Member 3", value: `<@${team.user3}>`, inline: true}
            )
        miniraction.editReply({
            content: "​",
            embeds: [embed]
        })
    }
}