const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        console.log(`${interaction.user.username} ran command ${interaction.commandName}.`)
        await interaction.reply('Pong!');

    },
};