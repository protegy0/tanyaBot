const { SlashCommandBuilder } = require('discord.js');
const malScraper = require('mal-scraper');
const search = malScraper.search

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Provides information on the anime given')
        .addStringOption(option =>
            option.setName('anime')
                .setDescription('The name of the anime')
                .setRequired(true)),
    async execute(interaction) {
        console.log(`${interaction.user.username} ran command ${interaction.commandName}.`)
        malScraper.getInfoFromName(interaction.options.get('anime').value).then(
            (data) => interaction.reply(`**${data.title}**\n\n${data.picture}\n${data.synopsis}`),
        )
    }
}