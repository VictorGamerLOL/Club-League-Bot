const Discord = require('discord.js')
const { guildId, token, clientId, pingRoleId, pingChannelId} = require('../../../config.json')
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
        try {
            var miniraction = await message.awaitMessageComponent({filter, time: 15000})
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
        if (!team.user1 == "Nobody" || !team.user2 == "Nobody" || !team.user3 == "Nobody") {
            var member1 = await interaction.guild.members.fetch(team.user1)
            var member2 = await interaction.guild.members.fetch(team.user2)
            var member3 = await interaction.guild.members.fetch(team.user3)
        } else {
            var member1 = {displayName: "Nobody"}
            var member2 = {displayName: "Nobody"}
            var member3 = {displayName: "Nobody"}
        }
        const embed = new Discord.EmbedBuilder()
            .setTitle(teamname)
            .setDescription(`Here are the details of team ***${teamname}***`)
            .addFields(
                {name: "Role", value: `<@&${team.roleid}>`, inline: false},
                {name: "Member 1", value: `${member1.displayName}`, inline: true},
                {name: "Member 2", value: `${member2.displayName}`, inline: true},
                {name: "Member 3", value: `${member3.displayName}`, inline: true}
            )
        miniraction.editReply({
            content: "​",
            embeds: [embed]
        })
    }
}