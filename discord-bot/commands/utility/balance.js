const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const currency = new Collection()
function getBalance(id) {
    const user = currency.get(id);
    return user ? user.balance : 0;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your moolah balance')
        .addUserOption(option => option.setName('user').setDescription('The user')),

    async execute(interaction) {
        console.log(`${interaction.user.username} ran command ${interaction.commandName}.`)
        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => currency.set(b.user_id, b));
        if (!(interaction.options.get('user') === null)) {
            interaction.reply(`<@${interaction.options.get('user').value}> has a balance of ${getBalance(interaction.options.get('user').value)}`);
        } else {
            let userBalance = getBalance(interaction.user.id);
            interaction.reply(`Your balance is ${userBalance} moolah`)
        }




    }
}