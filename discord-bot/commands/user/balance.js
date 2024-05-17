const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
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
        console.log(`${interaction.user.username} ran command ${interaction.commandName}.`)
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));

        if (interaction.options.getSubcommand() === 'moolah') {
            if (!(interaction.options.get('user') === null)) {
                interaction.reply(`<@${interaction.options.get('user').value}> has a balance of ${economy.getBalance(interaction.options.get('user').value, userInfo)}!`);
            } else {
                let userBalance = economy.getBalance(interaction.user.id, userInfo);
                interaction.reply(`Your balance is ${userBalance} moolah!`)
            }
        } else {
            if (!(interaction.options.get('user') === null)) {
                interaction.reply(`<@${interaction.options.get('user').value}> has ${economy.getGems(interaction.options.get('user').value, userInfo)} gems!`);
            } else {
                let userBalance = economy.getGems(interaction.user.id, userInfo);
                interaction.reply(`You have ${userBalance} gems!`)
            }
        }




    }
}