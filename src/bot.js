const Discord = require("discord.js");
const logger = require("./utilities/logger");
const schedule = require("node-schedule");
const { guildId, token, clientId, pingRoleId } = require("../config.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const sql = require("./utilities/sqlHandler.js");
const path = require("path");
const myIntents = [];
myIntents.push(Discord.GatewayIntentBits.Guilds);
myIntents.push(Discord.GatewayIntentBits.GuildMembers);
myIntents.push(Discord.GatewayIntentBits.GuildPresences);
myIntents.push(Discord.GatewayIntentBits.GuildVoiceStates);
myIntents.push(Discord.GatewayIntentBits.GuildMessages);
myIntents.push(Discord.GatewayIntentBits.GuildMessageReactions);
myIntents.push(Discord.GatewayIntentBits.MessageContent);

const rest = new REST({ version: "9" }).setToken(token);

logger.info("Starting bot...");
logger.info("Making client...");

const client = new Discord.Client({
  intents: myIntents,
  partials: [
    Discord.Partials.Message,
    Discord.Partials.Channel,
    Discord.Partials.Reaction,
    Discord.Partials.GuildMember,
  ],
});

logger.info("Client made");
logger.info("Registering commands...")

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync(path.join(__dirname, "./commands")); //Get folder of commands and sync with fs
var commands = [];

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, `./commands/${folder}`))
    .filter((file) => file.endsWith(".js")); //check folders in the folders (categorise) and read all he ones that end with js
  for (const file of commandFiles) {
    const command = require(path.join(
      __dirname,
      `./commands/${folder}/${file}`
    )); //import the command into bot.js from those files
    client.commands.set(command.name, command);
    commands.push(command.slashBuilder());
    logger.info("Registered command:", command.name);
  }
}

logger.info("Registered commands");
logger.info("Registering events...")

const eventFiles = fs
  .readdirSync(path.join(__dirname, "./events"))
  .filter((file) => file.endsWith(".js")); // same with commands but event handling

for (const file of eventFiles) {
  const event = require(path.join(__dirname, `./events/${file}`)); // import js file no categories
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
    logger.info("Registered one time event:", event.name);
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
    logger.info("Registered event:", event.name);
  }
}

logger.info("Registered events");
logger.info("Scheduling jobs...")

const scheduleFiles = fs
  .readdirSync(path.join(__dirname, "./schedules"))
  .filter((file) => file.endsWith(".js")); // same with commands but schedule handling

async function scheduler() {
  const state = await sql.getState("weekType");
  for (const file of scheduleFiles) {
    const scheduleFile = require(path.join(__dirname, `./schedules/${file}`));
    if (scheduleFile.type != state) continue;
    schedule.scheduleJob(
      scheduleFile.jobSchedule(),
      scheduleFile.execute.bind({client: client})
    );
    logger.info(`Scheduled ${scheduleFile.type} job:`, scheduleFile.name);
  }
  logger.info("Scheduled jobs");
}
scheduler();

async function putCommands() {
  try {
    logger.info("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    logger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger.error(error);
  }
}
putCommands();

async function buttonYes(interaction) {
  await interaction.deferReply({ ephemeral: true });
  if (!(await interaction.member.roles.cache.has(pingRoleId))) {
    interaction.editReply(
      "You already have done club league what do you want?"
    );
    return;
  }
  interaction.member.roles.remove(pingRoleId);
  interaction.editReply(
    "You have been removed from the notification role. Thanks for doing your part."
  );
  return;
}
async function buttonNo(interaction) {
  await interaction.deferReply({ ephemeral: true });
  if (await interaction.member.roles.cache.has(pingRoleId)) {
    interaction.editReply(
      "You already have the club league notification role what do you want?"
    );
    return;
  }
  interaction.member.roles.add(pingRoleId);
  interaction.editReply("You have gained the club league notification role");
  return;
}

client.on("interactionCreate", async function (interaction) {
  if (interaction.type == Discord.InteractionType.ApplicationCommand) {
    const command = client.commands.get(interaction.commandName);
    if (command.permissionRequirements != undefined) {
      if (!interaction.member.permissions.has(command.permissionRequirements)) {
        await interaction.reply("You are not allowed to use this command");
        return;
      }
    }

    if (!command) return;
    command.execute(interaction);
  }
  if (interaction.type == Discord.InteractionType.MessageComponent) {
    if (interaction.customId === "yes") {
      buttonYes(interaction);
    }
    if (interaction.customId === "no") {
      buttonNo(interaction);
    } else return;
  }
});
client.login(token);

sql.init();

logger.info("Initialising week toggler job...");

const weekToggleJob = new schedule.RecurrenceRule();
weekToggleJob.dayOfWeek = 6;
weekToggleJob.hour = 14;
weekToggleJob.minute = 1;
weekToggleJob.tz = "ETC/UTC";

const weekToggle = async () => {
  const state = await sql.getState("weekType");
  if (state == "league") {
    logger.info("Changing week type to 'quest'");
    await sql.setState("weekType", "quest");
    schedule.gracefulShutdown();
    logger.info("Terminated current jobs");
    await scheduler();
    schedule.scheduleJob(weekToggleJob, weekToggle);
    logger.info("Successfully changed week type to 'quest'");
  }
  if (state == "quest") {
    logger.info("Changing week type to 'league'");
    await sql.setState("weekType", "league");
    schedule.gracefulShutdown();
    logger.info("Terminated current jobs");
    await scheduler();
    schedule.scheduleJob(weekToggleJob, weekToggle);
    logger.info("Successfully changed week type to 'league'");
  }
}

schedule.scheduleJob(weekToggleJob, weekToggle);
logger.info("Week toggler job started");