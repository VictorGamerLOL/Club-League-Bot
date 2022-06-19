const Discord = require('discord.js');
const fs = require('fs');
const {guildId, token, clientId, pingRoleId, pingChannelId, logChannelId} = require('../../../config.json')

module.exports = {
    name: 'send',
    description: 'Send the message with the buttons to the ping channel.',
    slashBuilder () {
        const command = new Discord.SlashCommandBuilder()
            .setName('send')
            .setDescription('Send the message with the buttons to the ping channel.')
        return command.toJSON()
    },
    async execute (interaction) {
        await interaction.deferReply()
        let channel = await interaction.client.channels.fetch(pingChannelId)
        let yes = new Discord.ButtonBuilder()
            .setCustomId("yes")
            .setLabel("Yes")
            .setStyle(Discord.ButtonStyle.Success)
        let no = new Discord.ButtonBuilder()
            .setCustomId("no")
            .setLabel("No")
            .setStyle(Discord.ButtonStyle.Danger)
        let row = new Discord.ActionRowBuilder()
            .addComponents([yes, no])
        const message = await channel.send({
            content: `<@&${pingRoleId}>\nA new day of Club league has started.\nHave you done your club league?`,
            components: [row]
        })
        fs.writeFileSync('./message.txt', message.id)
        interaction.editReply("I sent the message to the channel you specified")
    }
}