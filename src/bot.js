const Discord = require('discord.js')
const schedule = require('node-schedule')
const {guildId, token, clientId, pingRoleId, pingChannelId} = require('../config.json')
const { REST }= require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9');
const fs = require('fs')
const sql = require('./utilities/sqlHandler.js')
const path = require('path');
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
const clientObj = {client: client}

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

const scheduleFiles = fs.readdirSync(path.join(__dirname, './schedules')).filter(file => file.endsWith('.js')); // same with commands but schedule handling

for (const file of scheduleFiles) {
    const scheduleFile = require(path.join(__dirname, `./schedules/${file}`));
    schedule.scheduleJob(scheduleFile.jobSchedule(), scheduleFile.execute.bind(clientObj));
}

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

client.on('interactionCreate', async function(interaction) {
    if (interaction.type == Discord.InteractionType.ApplicationCommand) {
        const command = client.commands.get(interaction.commandName)
	if (command.permissionRequirements != undefined) {
		if (!interaction.member.permissions.has(command.permissionRequirements)) {
            await interaction.reply("You are not allowed to use this command")
            return
        }
	}
        
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

sql.init()
