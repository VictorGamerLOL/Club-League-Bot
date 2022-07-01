const Discord = require('discord.js');
const { guildId, token, clientId, pingRoleId, pingChannelId} = require('../../../config.json');
const sql = require('../../utilities/sqlHandler');

//module.exports
module.exports = {
    name: 'maketeam',
    description: 'Make a team.',
    permissionRequirements: ['ManageGuild'],
    slashBuilder () {
        const command = new Discord.SlashCommandBuilder()
            .setName('maketeam')
            .setDescription('Make a team.')
            .addStringOption(option =>
                option.setName('teamname')
                    .setDescription('The name of the team.')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role of the team.')
                    .setRequired(true)
            );
        return command.toJSON()
    },
    async execute (interaction) {
        await interaction.deferReply();
        teamname = await interaction.options.getString('teamname');
        role = await interaction.options.getRole('role');
        sql.maketeam(teamname, role.id);
        interaction.editReply("I have made the team.");
    }
}