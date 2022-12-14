const {
  Client,
  GatewayIntentBits,
  Collection,
  ChatInputCommandInteraction,
  Partials,
  InteractionType,
} = require("discord.js");
const logger = require("./utilities/logger");
const schedule = require("node-schedule");
const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const sql = require("./utilities/sqlHandler.js");
const path = require("path");
const { weekToggle } = require("./utilities/weekToggle");

dotenv.config();
const GUILDID = process.env.GUILDID;
const TOKEN = process.env.TOKEN;
const CLIENTID = process.env.CLIENTID;
const PINGROLEID = process.env.PINGROLEID;
const myIntents = [];
myIntents.push(GatewayIntentBits.Guilds);
myIntents.push(GatewayIntentBits.GuildMembers);
myIntents.push(GatewayIntentBits.GuildPresences);
myIntents.push(GatewayIntentBits.GuildVoiceStates);
myIntents.push(GatewayIntentBits.GuildMessages);
myIntents.push(GatewayIntentBits.GuildMessageReactions);
myIntents.push(GatewayIntentBits.MessageContent);

const rest = new REST({ version: "9" }).setToken(TOKEN);

logger.info("Starting bot...");
logger.info("Making client...");

/**
 * The client that is used by the bot to connect to discord,
 * with a property that stores a Discord.js collection of commands.
 * @type {Client & { commands: Collection<string, command> } }
 */
const client = new Client({
  intents: myIntents,
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
  ],
}); //Because of no typescript shenanigans I can add the commands property later.

logger.info("Client made");
logger.info("Registering commands...");

client.commands = new Collection();
const commandFolders = fs.readdirSync(path.join(__dirname, "./commands")); //Get folder of commands and sync with fs
/** @type {RESTPostAPIApplicationCommandsJSONBody[]} */
var commands = [];

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, `./commands/${folder}`))
    .filter((file) => file.endsWith(".js")); //check folders in the folders (categorise) and read all he ones that end with js
  for (const file of commandFiles) {
    /**
     * The current command that it is being handled.
     * @type {command}
     */
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
logger.info("Registering events...");

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
logger.info("Scheduling jobs...");

const scheduleFiles = fs
  .readdirSync(path.join(__dirname, "./schedules"))
  .filter((file) => file.endsWith(".js")); // same with commands but schedule handling
async function scheduler() {
  await sql.init();
  const state = await sql.getState("weekType");
  for (const file of scheduleFiles) {
    const scheduleFile = require(path.join(__dirname, `./schedules/${file}`));
    if (scheduleFile.type != state && scheduleFile.type != "any") continue;
    schedule.scheduleJob(
      scheduleFile.jobSchedule(),
      scheduleFile.execute.bind({ client: client })
    );
    logger.info(`Scheduled ${scheduleFile.type} job:`, scheduleFile.name);
  }
  logger.info("Scheduled jobs");
}
scheduler();

async function putCommands() {
  try {
    logger.info("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(CLIENTID, GUILDID), {
      body: commands,
    });

    logger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger.error(error);
  }
}
putCommands();

/**
 * Contains the function that must be done when the Yes button is pressed.
 * It checks if the user has already done club league and responds accordingly.
 * @param {ChatInputCommandInteraction} interaction
 * @returns {void}
 */
async function buttonYes(interaction) {
  await interaction.deferReply({ ephemeral: true });
  if (!(await interaction.member.roles.cache.has(PINGROLEID))) {
    interaction.editReply(
      "You already have done club league what do you want?"
    );
    return;
  }
  interaction.member.roles.remove(PINGROLEID);
  interaction.editReply(
    "You have been removed from the notification role. Thanks for doing your part."
  );
  return;
}
/**
 *
 * @param {ChatInputCommandInteraction} interaction
 * @returns {void}
 */
async function buttonNo(interaction) {
  await interaction.deferReply({ ephemeral: true });
  if (await interaction.member.roles.cache.has(PINGROLEID)) {
    interaction.editReply(
      "You already have the club league notification role what do you want?"
    );
    return;
  }
  interaction.member.roles.add(PINGROLEID);
  interaction.editReply("You have gained the club league notification role");
  return;
}

client.on("interactionCreate", async function (interaction) {
  if (interaction.type == InteractionType.ApplicationCommand) {
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
  if (interaction.type == InteractionType.MessageComponent) {
    if (interaction.customId === "yes") {
      buttonYes(interaction);
    }
    if (interaction.customId === "no") {
      buttonNo(interaction);
    } else return;
  }
});
client.login(TOKEN);

logger.info("Initialising week toggler job...");

const weekToggleJob = new schedule.RecurrenceRule();
weekToggleJob.dayOfWeek = 1;
weekToggleJob.hour = 14;
weekToggleJob.minute = 1;
weekToggleJob.tz = "ETC/UTC";

schedule.scheduleJob(weekToggleJob, weekToggle(scheduler, weekToggleJob));
logger.info("Week toggler job started");
