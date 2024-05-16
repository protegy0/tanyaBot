const { SlashCommandBuilder, Collection } = require("discord.js");
const { Users, CurrencyShop, GemShop } = require("../../dbObjects");
const userInfo = new Collection()
const { Op } = require('sequelize')
function getBalance(id) {
    const user = userInfo.get(id);
    return user ? user.balance : 0;
}
function getGems(id) {
    const user = userInfo.get(id);
    return user ? user.gems : 0;
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Buy something from the shop")
        .addSubcommand(subcommand =>
            subcommand
                .setName('moolah')
                .setDescription('Buy from the moolah shop')
                .addStringOption(option =>
                    option.setName("item")
                        .setDescription("Item to buy")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("amount")
                        .setDescription("Amount to buy")
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(300)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('gems')
                .setDescription('Buy from the gems shop')
                .addStringOption(option =>
                    option.setName("item")
                        .setDescription("Item to buy")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("amount")
                        .setDescription("Amount to buy")
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(300))),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        if (interaction.options.getSubcommand() === 'moolah') {
            const itemName = interaction.options.get('item').value
            const amount = interaction.options.get('amount').value

            const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
            if (!item) {
                interaction.reply('That item does not exist');
            } else if ((item.cost) * amount > getBalance(interaction.user.id)) {
                interaction.reply(`You currently have ${getBalance(interaction.user.id)} moolah, but ${amount} ${item.name}(s) costs ${item.cost * amount}!`);
            } else {
                const user = await Users.findOne({ where: { user_id: interaction.user.id } });
                addBalance(interaction.user.id, ((-item.cost) * amount));
                for (let i = 0; i < amount; i++) {
                    await user.addItem(item)
                }
                interaction.reply(`You've bought: ${amount} ${item.name}(s).`)
            }
        } else {
            const itemName = interaction.options.get('item').value
            const amount = interaction.options.get('amount').value

            const item = await GemShop.findOne({ where: { name: { [Op.like]: itemName } } });
            if (!item) {
                interaction.reply('That item does not exist');
            } else if ((item.cost) * amount > getGems(interaction.user.id)) {
                interaction.reply(`You currently have ${getGems(interaction.user.id)} gems, but ${amount} ${item.name}(s) costs ${item.cost * amount}!`);
            } else {
                const user = await Users.findOne({ where: { user_id: interaction.user.id } });
                addGems(interaction.user.id, ((-item.cost) * amount));
                for (let i = 0; i < amount; i++) {
                    await user.addItem(item)
                }
                interaction.reply(`You've bought: ${amount} ${item.name}(s).`)
            }
        }


    }
}