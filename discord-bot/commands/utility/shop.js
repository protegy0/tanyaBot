const { SlashCommandBuilder, codeBlock} = require("discord.js");
const { CurrencyShop } = require("../../dbObjects");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Check the shop"),
    async execute(interaction) {
        const shopItems = await CurrencyShop.findAll();
        interaction.reply(codeBlock(shopItems.map(i => `${i.name}: ${i.cost}💰`).join('\n')));
    }
}