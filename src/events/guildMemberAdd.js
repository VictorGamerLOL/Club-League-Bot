const Discord = require('discord.js')
const { guildId, token, clientId, pingRoleId, pingChannelId, logChannelId } = require('../../config.json')
const sql = require('../utilities/sqlHandler')

module.exports ={
    name: "guildMemberRemove",
    once: false,
    async execute(GuildMember) {
        sql.addmember(GuildMember.id)
    }
}