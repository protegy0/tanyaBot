const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
function getGems(id) {
    const user = userInfo.get(id);
    return user ? user.gems : 0;
}

async function addGems(id, amount) {
    const user = userInfo.get(id);

    if (user) {
        user.gems += Number(amount);
        return user.save();
    }

    const newUser = await Users.create({ user_id: id, gems: amount });
    userInfo.set(id, newUser);

    return newUser;
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
        .setName('convert')
        .setDescription('Convert your gems to moolah! 1 gem = 25 moolah')
        .addIntegerOption(
            option =>
                option.setName('amount')
                    .setDescription('Amount to convert')
                    .setRequired(true)
                    .setMinValue(1)),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        const userId = interaction.user.id;
        const amount = interaction.options.get('amount').value
        if (getGems(userId) >= amount) {
            addGems(userId, -amount);
            addBalance(userId, (amount * 50));
            interaction.reply(`Converted ${amount} gems to ${amount * 25} moolah!`)
        } else {
            interaction.reply({
                content: `You don't have enough gems to do that.`,
                ephemeral: true,
            })
        }
    }
}