const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
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
        .setName('give')
        .setDescription('for protegy only')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('user to give')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('amount to give')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.user.id === '295074068581974026') {
            addBalance(interaction.options.get('user').value, interaction.options.get('amount').value)
            interaction.reply({
                content: 'given',
                ephemeral: true
            })
        } else {
            interaction.reply('no')
        }
    }
}