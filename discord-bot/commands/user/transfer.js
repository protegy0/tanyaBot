const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
const economy = require('../../importantfunctions/economy.js')

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
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        let userBalance = economy.getBalance(interaction.user.id, userInfo)
        let userId = interaction.user.id
        let transferId = interaction.options.get('person1').value
        let transferAmount = interaction.options.get('transfer-amount').value
        if (transferAmount > userBalance) {
            interaction.reply('You do not have enough moolah to make this transfer!')
        } else {
            economy.addBalance(userId, -transferAmount, userInfo)
            economy.addBalance(transferId, transferAmount, userInfo)
            interaction.reply(`${transferAmount} moolah has been transferred from <@${userId}> to <@${transferId}>!`)
        }
    }
}