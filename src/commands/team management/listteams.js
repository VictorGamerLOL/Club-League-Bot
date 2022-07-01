const Discord = require('discord.js');
const { guildId, token, clientId, pingRoleId, pingChannelId} = require('../../../config.json');
const sql = require('../../utilities/sqlHandler');

module.exports = {
    name: 'listteams',
    description: 'List all teams.',
    slashBuilder () {
        const command = new Discord.SlashCommandBuilder()
            .setName('listteams')
            .setDescription('List all teams.');
        return command.toJSON()
    },
    async execute (interaction) {
        await interaction.deferReply();
        let teams = await sql.listteams();
        let embed = new Discord.EmbedBuilder()
            .setTitle('Teams')
            .setDescription("Here's a list of all teams and their members.");
        for (let team of teams) {
            if (team.user1 != "Nobody" || team.user2 != "Nobody" || team.user3 != "Nobody") {
                var member1 = await interaction.guild.members.fetch(team.user1);
                var member2 = await interaction.guild.members.fetch(team.user2);
                var member3 = await interaction.guild.members.fetch(team.user3);
            } else {
                var member1 = {displayName: "Nobody"};
                var member2 = {displayName: "Nobody"};
                var member3 = {displayName: "Nobody"};
            };
            const members = [member1.displayName, member2.displayName, member3.displayName];
            embed.addFields({name : team.name, value : members.join(', ')});
        };
        await interaction.deleteReply();
        await interaction.channel.send({
            content: "​", //Disregard the invisible character
            embeds: [embed]
        });
    }
}
