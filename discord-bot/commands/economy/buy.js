const { SlashCommandBuilder } = require("discord.js");
const { Users, CurrencyShop, GemShop } = require("../../dbObjects");
const { Op } = require('sequelize')
const { balance, gems} = require('../../importantfunctions/mutators.js')


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
        if (interaction.options.getSubcommand() === 'moolah') {
            const itemName = interaction.options.get('item').value
            const amount = interaction.options.get('amount').value
            const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
            if (!item) {
                interaction.reply('That item does not exist');
            } else if ((item.cost) * amount > balance.getBalance(interaction.user.id)) {
                interaction.reply(`You currently have ${balance.getBalance(interaction.user.id)} moolah, but ${amount} ${item.name}(s) costs ${item.cost * amount}!`);
            } else {
                const user = await Users.findOne({ where: { user_id: interaction.user.id } });
                balance.addBalance(interaction.user.id, ((-item.cost) * amount));
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
            } else if ((item.cost) * amount > gems.getGems(interaction.user.id)) {
                interaction.reply(`You currently have ${gems.getGems(interaction.user.id)} gems, but ${amount} ${item.name}(s) costs ${item.cost * amount}!`);
            } else {
                const user = await Users.findOne({ where: { user_id: interaction.user.id } });
                gems.addGems(interaction.user.id, ((-item.cost) * amount));
                for (let i = 0; i < amount; i++) {
                    await user.addItem(item)
                }
                interaction.reply(`You've bought: ${amount} ${item.name}(s).`)
            }
        }


    }
}