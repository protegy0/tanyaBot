const { SlashCommandBuilder } = require('discord.js');
const economy = require('../../importantfunctions/economy.js')



module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your moolah balance')
        .addSubcommand(subcommand =>
            subcommand
                .setName('moolah')
                .setDescription('See your current moolah balance')
                .addUserOption(option => option.setName('user').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('gems')
                .setDescription('See your current gem balance')
                .addUserOption(option => option.setName('user').setDescription('The user'))),


    async execute(interaction) {


        if (interaction.options.getSubcommand() === 'moolah') {
            if (!(interaction.options.get('user') === null)) {
                interaction.reply(`<@${interaction.options.get('user').value}> has a balance of ${economy.getBalance(interaction.options.get('user').value)}!`);
            } else {
                let userBalance = economy.getBalance(interaction.user.id);
                interaction.reply(`Your balance is ${userBalance} moolah!`)
            }
        } else {
            if (!(interaction.options.get('user') === null)) {
                interaction.reply(`<@${interaction.options.get('user').value}> has ${economy.getGems(interaction.options.get('user').value)} gems!`);
            } else {
                let userBalance = economy.getGems(interaction.user.id);
                interaction.reply(`You have ${userBalance} gems!`)
            }
        }




    }
}