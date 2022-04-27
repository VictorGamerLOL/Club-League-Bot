const Discord = require('discord.js')
const schedule = require('node-schedule')
const {guildId, token, clientId, pingRoleId} = require('./config.json')
const { REST }= require('@discordjs/rest')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Routes } = require('discord-api-types/v9');

const rule1 = new schedule.RecurrenceRule()
rule1.dayOfWeek = 3;
rule1.hour = 14;
rule1.minute = 0;

const rule2 = new schedule.RecurrenceRule()
rule2.dayOfWeek = 4;
rule2.hour = 14;
rule2.minute = 0;

const rule3 = new schedule.RecurrenceRule()
rule3.dayOfWeek = 5;
rule3.hour = 14;
rule3.minute = 0;

const rule4 = new schedule.RecurrenceRule()
rule4.dayOfWeek = 6;
rule4.hour = 14;
rule4.minute = 0;

const rule5 = new schedule.RecurrenceRule()
rule5.dayOfWeek = 0;
rule5.hour = 14;
rule5.minute = 0;


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
    .setDescription('Send the message with the buttons to a specified channel')
    .addChannelOption(option => 
        option.setName('channel')
            .setDescription('The channel to send the message to')
            .setRequired(true))
var commands = [];
console.log(commands)
commands.push(sendCommand.toJSON())

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
    let channel = interaction.options.getChannel('channel')
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
    channel.send({
        content: "Have you done your club league?",
        components: [row]
    })
    interaction.editReply("I will send the message to the channel you specified")
}

async function buttonYes (interaction) {
    await interaction.deferReply({ephemeral: true})
    try {
        interaction.member.roles.remove(pingRoleId)
        interaction.editReply("You have been removed from the ping role. Thanks for doing your part.")
    } catch {
        interaction.editReply("You already have done club league what do you want?")
    }
    return
}
async function buttonNo (interaction) {
    await interaction.deferReply({ephemeral: true})
    try {
        interaction.member.roles.add(pingRoleId)
        interaction.editReply("You have gained the club league ping role")
    } catch {
        interaction.editReply("You already have the club league ping role")
    }
    return
}

client.on('interactionCreate', async function(interaction) {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'send') {
            commandSend(interaction)
        }
        else return
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