const Discord = require('discord.js');
const {guildId, token, clientId, pingRoleId, pingChannelId} = require('../../../config.json')

module.exports = {
    name: 'takerole',
    description: 'Take away the club notification role from everyone on the server.',
    permissionRequirements: ['ManageGuild'],
    slashBuilder () {
        const command = new Discord.SlashCommandBuilder()
            .setName('takerole')
            .setDescription('Take away the club notification role from everyone on the server.')
        return command.toJSON()
    },
    async execute (interaction) {
        await interaction.deferReply()
        let guild = await interaction.client.guilds.fetch(guildId)
        let members = await guild.members.fetch()
        for (let member of members) {
            if (member[1].roles.cache.has(pingRoleId)) {
                await member[1].roles.remove(pingRoleId)
            }
        }
        interaction.editReply("I have taken away the role from everyone.")
    }
}