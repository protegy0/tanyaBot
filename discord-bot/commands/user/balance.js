const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
function getBalance(id) {
    const user = userInfo.get(id);
    return user ? user.balance : 0;
}
function getGems(id) {
    const user = userInfo.get(id);
    return user ? user.gems : 0;
}



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
                interaction.reply(`<@${interaction.options.get('user').value}> has a balance of ${getBalance(interaction.options.get('user').value)}!`);
            } else {
                let userBalance = getBalance(interaction.user.id);
                interaction.reply(`Your balance is ${userBalance} moolah!`)
            }
        } else {
            if (!(interaction.options.get('user') === null)) {
                interaction.reply(`<@${interaction.options.get('user').value}> has ${getGems(interaction.options.get('user').value)} gems!`);
            } else {
                let userBalance = getGems(interaction.user.id);
                interaction.reply(`You have ${userBalance} gems!`)
            }
        }




    }
}