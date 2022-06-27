const Discord = require('discord.js')
const { guildId, token, clientId, pingRoleId, pingChannelId, logChannelId } = require('../../config.json')
const sql = require('../utilities/sqlHandler')

module.exports ={
    name: "messageCreate",
    once: false,
    async execute(message) {
        const azuma = new RegExp('azuma*', 'i')
        if (azuma.test(message.content)) {
            message.channel.send("Sussy baka")
            message.react("980106629011877910")
        }
    }
}
