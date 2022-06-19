const Discord = require('discord.js')
const schedule = require('node-schedule')
const {guildId, token, clientId, pingRoleId, pingChannelId, logChannelId} = require('../config.json')
const { REST }= require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9');
const fs = require('fs')
const sql = require('./utilities/sqlHandler.js')
const path = require('path')
const myIntents = []
myIntents.push(Discord.GatewayIntentBits.Guilds)
myIntents.push(Discord.GatewayIntentBits.GuildMembers)
myIntents.push(Discord.GatewayIntentBits.GuildPresences)
myIntents.push(Discord.GatewayIntentBits.GuildVoiceStates)
myIntents.push(Discord.GatewayIntentBits.GuildMessages)
myIntents.push(Discord.GatewayIntentBits.GuildMessageReactions)
myIntents.push(Discord.GatewayIntentBits.MessageContent)

const rest = new REST({ version: '9' }).setToken(token);

const client = new Discord.Client({intents: myIntents,partials: [Discord.Partials.Message, Discord.Partials.Channel, Discord.Partials.Reaction, Discord.Partials.GuildMember]}); //Init Discord Client Instance

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync(path.join(__dirname, './commands')); //Get folder of commands and sync with fs
var commands = [];

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(path.join(__dirname, `./commands/${folder}`)).filter(file => file.endsWith('.js')); //check folders in the folders (categorise) and read all he ones that end with js
	for (const file of commandFiles) {
		const command = require((path.join(__dirname, `./commands/${folder}/${file}`))); //import the command into bot.js from those files
		client.commands.set(command.name, command);
        commands.push(command.slashBuilder())
	}
}

const eventFiles = fs.readdirSync(path.join(__dirname, './events')).filter(file => file.endsWith('.js')); // same with commands but event handling

for (const file of eventFiles) {
	const event = require(path.join(__dirname, `./events/${file}`)); // import js file no categories
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

const rulesStart = new schedule.RecurrenceRule()
rulesStart.dayOfWeek = [0, 3, 5]
rulesStart.hour = 14
rulesStart.minute = 0
rulesStart.tz = "Etc/UTC"

const rules1HourBefore = new schedule.RecurrenceRule()
rules1HourBefore.dayOfWeek = [1, 4, 6]
rules1HourBefore.hour = 13
rules1HourBefore.minute = 0
rules1HourBefore.tz = "Etc/UTC"

const rulesEnd = new schedule.RecurrenceRule()
rulesEnd.dayOfWeek = [1, 4, 6]
rulesEnd.hour = 14
rulesEnd.minute = 0
rulesEnd.tz = "Etc/UTC"

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
    const message = await channel.messages.fetch(fs.readFileSync('../message.txt', 'utf8'))
    message.delete()
    const message2 = await channel.messages.fetch(fs.readFileSync('../message2.txt', 'utf8'))
    message2.delete()
    let logMessage = `Members that did not do club league:\n`
    notDoneMembers.forEach(memberid => {
        logMessage += `<@${memberid}>\n`
    })
    logChannel.send(logMessage)

}

client.on('interactionCreate', async function(interaction) {
    if (interaction.type == Discord.InteractionType.ApplicationCommand) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            interaction.reply("You are not allowed to use this command")
            return
        }
        const command = client.commands.get(interaction.commandName) 
        if (!command) return
        command.execute(interaction)
    }
    if (interaction.type == Discord.InteractionType.MessageComponent) {
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
sql.init()