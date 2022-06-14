const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders')
const {guildId, token, clientId, pingRoleId, pingChannelId, logChannelId} = require('../../../config.json')

module.exports = {
    name: 'send',
    description: 'Send the message with the buttons to the ping channel.',
    slashBuilder () {
        const command = new SlashCommandBuilder()
            .setName('send')
            .setDescription('Send the message with the buttons to the ping channel.')
        return command.toJSON()
    },
    async execute (interaction) {
        await interaction.deferReply()
        let channel = interaction.client.channels.fetch(pingChannelId)
        let yes = new Discord.MessageButton()
            .setCustomId("yes")
            .setLabel("Yes")
            .setStyle("SUCCESS")
        let no = new Discord.MessageButton()
            .setCustomId("no")
            .setLabel("No")
            .setStyle("DANGER")
        let row = new Discord.MessageActionRow()
            .addComponents([yes, no])
        const message = await channel.send({
            content: `<@&${pingRoleId}>\nA new day of Club league has started.\nHave you done your club league?`,
            components: [row]
        })
        fs.writeFileSync('../../../message.txt', message.id)
        interaction.editReply("I sent the message to the channel you specified")
    }
}