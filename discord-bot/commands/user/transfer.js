const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
function getBalance(id) {
    const user = userInfo.get(id);
    return user ? user.balance : 0;
}
async function addBalance(id, amount) {
    const user = userInfo.get(id);

    if (user) {
        user.balance += Number(amount);
        return user.save();
    }

    const newUser = await Users.create({ user_id: id, balance: amount });
    userInfo.set(id, newUser);

    return newUser;
}

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
        let userBalance = getBalance(interaction.user.id)
        let userId = interaction.user.id
        let transferId = interaction.options.get('person1').value
        let transferAmount = interaction.options.get('transfer-amount').value
        if (transferAmount > userBalance) {
            interaction.reply('You do not have enough moolah to make this transfer!')
        } else {
            addBalance(userId, -transferAmount)
            addBalance(transferId, transferAmount)
            interaction.reply(`${transferAmount} moolah has been transferred from <@${userId}> to <@${transferId}>!`)
        }
    }
}