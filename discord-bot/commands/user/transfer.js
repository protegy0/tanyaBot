const { SlashCommandBuilder } = require('discord.js');
const { balance } = require('../../importantfunctions/mutators.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer your moolah to another person!')
        .addMentionableOption(
            option =>
                option.setName('person1')
                    .setDescription('Person to give moolah to')
                    .setRequired(true))
        .addIntegerOption(
            option =>
                option.setName('transfer-amount')
                    .setDescription('Amount to transfer')
                    .setRequired(true)
                    .setMinValue(1)),
    async execute(interaction) {
        let userBalance = balance.getBalance(interaction.user.id)
        let userId = interaction.user.id
        let transferId = interaction.options.get('person1').value
        let transferAmount = interaction.options.get('transfer-amount').value
        if (transferAmount > userBalance) {
            interaction.reply('You do not have enough moolah to make this transfer!')
        } else {
            balance.addBalance(userId, -transferAmount)
            balance.addBalance(transferId, transferAmount)
            interaction.reply(`${transferAmount} moolah has been transferred from <@${userId}> to <@${transferId}>!`)
        }
    }
}