const Discord = require('discord.js')
const schedule = require('node-schedule')
const {guildId, token, clientId, pingRoleId, pingChannelId, logChannelId} = require('./config.json')
const { REST }= require('@discordjs/rest')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Routes } = require('discord-api-types/v9');
const fs = require('fs')

const rulesStart = new schedule.RecurrenceRule()
rulesStart.dayOfWeek = [0, 3, 5]
rulesStart.hour = 14
rulesStart.minute = 0

const rules1HourBefore = new schedule.RecurrenceRule()
rules1HourBefore.dayOfWeek = [1, 4, 6]
rules1HourBefore.hour = 13
rules1HourBefore.minute = 0

const rulesEnd = new schedule.RecurrenceRule()
rulesEnd.dayOfWeek = [1, 4, 6]
rulesEnd.hour = 14
rulesEnd.minute = 0


const myIntents = new Discord.Intents()
	.add(Discord.Intents.FLAGS.GUILDS)
	.add(Discord.Intents.FLAGS.GUILD_MEMBERS)
	.add(Discord.Intents.FLAGS.GUILD_BANS)
	.add(Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS)
	.add(Discord.Intents.FLAGS.GUILD_INTEGRATIONS)
	.add(Discord.Intents.FLAGS.GUILD_WEBHOOKS)
	.add(Discord.Intents.FLAGS.GUILD_INVITES)
	.add(Discord.Intents.FLAGS.GUILD_VOICE_STATES) //All the intents just to be sure :)
	.add(Discord.Intents.FLAGS.GUILD_PRESENCES)
	.add(Discord.Intents.FLAGS.GUILD_MESSAGES)
	.add(Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
	.add(Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING)
	.add(Discord.Intents.FLAGS.DIRECT_MESSAGES)
	.add(Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS)
	.add(Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING)
	.add(Discord.Intents.FLAGS.GUILD_SCHEDULED_EVENTS)

const rest = new REST({ version: '9' }).setToken(token);

const client = new Discord.Client({intents: myIntents,partials: ['MESSAGE', 'CHANNEL', 'REACTION']}); //Init Discord Client Instance

const sendCommand = new SlashCommandBuilder()
    .setName('send')
    .setDescription('Send the message with the buttons to a specified channel.')
const giveRoleCommand = new SlashCommandBuilder()
    .setName('giverole')
    .setDescription('Give everyone on the server the club notification role.')
const takeRoleCommand = new SlashCommandBuilder()
    .setName('takerole')
    .setDescription('Take away from everyone on the server the club notification role.')
var commands = [];
commands.push(sendCommand.toJSON())
commands.push(giveRoleCommand.toJSON())
commands.push(takeRoleCommand.toJSON())

async function putCommands () {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
};
putCommands()

async function commandSend (interaction) {
    await interaction.deferReply()
    let channel = client.channels.fetch(pingChannelId)
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
        content: "<@&${pingRoleId}>\nA new day of Club league has started.\nHave you done your club league?",
        components: [row]
    })
    fs.writeFileSync('./message.txt', message.id)
    interaction.editReply("I sent the message to the channel you specified")
}
async function commandGiveRole (interaction) {
    await interaction.deferReply()
    let guild = await client.guilds.fetch(guildId)
    let members = await guild.members.fetch()
    for (let member of members) {
        if (!member[1].roles.cache.has(pingRoleId)) { //Do not ask me why it starts at array index 1 for I do not know why :<
            await member[1].roles.add(pingRoleId)
        }
    }
    interaction.editReply("I have given everyone the role.")
}
async function commandTakeRole (interaction) {
    await interaction.deferReply()
    let guild = await client.guilds.fetch(guildId)
    let members = await guild.members.fetch()
    for (let member of members) {
        if (member[1].roles.cache.has(pingRoleId)) { //Do not ask me why it starts at array index 1 for I do not know why :<
            await member[1].roles.remove(pingRoleId)
        }
    }
    interaction.editReply("I taken away the role from everyone.")
}

async function buttonYes (interaction) {
    await interaction.deferReply({ephemeral: true})
    if (!await interaction.member.roles.cache.has(pingRoleId)) {
        interaction.editReply("You already have done club league what do you want?")
        return
    }
    interaction.member.roles.remove(pingRoleId)
    interaction.editReply("You have been removed from the notification role. Thanks for doing your part.")
    return
}
async function buttonNo (interaction) {
    await interaction.deferReply({ephemeral: true})
    if (await interaction.member.roles.cache.has(pingRoleId)) {
        interaction.editReply("You already have the club league notification role what do you want?")
        return
    }
    interaction.member.roles.add(pingRoleId)
    interaction.editReply("You have gained the club league notification role")
    return
}
async function startOfDay (){
    const guild = await client.guilds.fetch(guildId)
    const channel = await client.channels.fetch(pingChannelId)
    const members = await guild.members.fetch()
    for (let member of members) {
        if (!member[1].roles.cache.has(pingRoleId)) { //Do not ask me why it starts at array index 1 for I do not know why :<
            await member[1].roles.add(pingRoleId)
        }
    }
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
    fs.writeFileSync('./message.txt', message.id)
}
async function oneHourBefore (){
    const channel = await client.channels.fetch(pingChannelId)
    const message = await channel.send(`<@&${pingRoleId}>\n1 hour remains of club league.\nHave you done your club league?`)
    fs.writeFileSync('./message2.txt', message.id)
}
async function endOfDay (){
    let notDoneMembers = []
    const guild = await client.guilds.fetch(guildId)
    const channel = await client.channels.fetch(pingChannelId)
    const logChannel = await client.channels.fetch(logChannelId)
    const members = await guild.members.fetch()
    for (let member of members) {
        if (member[1].roles.cache.has(pingRoleId)) { //Do not ask me why it starts at array index 1 for I do not know why :<
            notDoneMembers.push(member[1].id)
            await member[1].roles.remove(pingRoleId)
        }
    }
    const message = await channel.messages.fetch(fs.readFileSync('./message.txt', 'utf8'))
    message.delete()
    const message2 = await channel.messages.fetch(fs.readFileSync('./message2.txt', 'utf8'))
    message2.delete()
    let logMessage = `Members that did not do club league:\n`
    notDoneMembers.forEach(memberid => {
        logMessage += `<@${memberid}>\n`
    })
    logChannel.send(logMessage)

}

client.on('interactionCreate', async function(interaction) {
    if (interaction.isCommand()) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            interaction.reply("You are not allowed to use this command")
            return
        }
        if (interaction.commandName === 'send') {
            commandSend(interaction)
            return
        }
        if (interaction.commandName === 'giverole') {
            commandGiveRole(interaction)
            return
        }
        if (interaction.commandName === 'takerole') {
            commandTakeRole(interaction)
            return
        }
    }
    if (interaction.isButton()) {
        if (interaction.customId === 'yes') {
            buttonYes(interaction)
        } if (interaction.customId === 'no') {
            buttonNo(interaction)
        } else return
    }
})
client.login(token)

const jobStart = schedule.scheduleJob(rulesStart, startOfDay)
const jobOneHourBefore = schedule.scheduleJob(rules1HourBefore, oneHourBefore)
const jobEnd = schedule.scheduleJob(rulesEnd, endOfDay)
