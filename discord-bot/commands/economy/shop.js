const { SlashCommandBuilder, codeBlock} = require("discord.js");
const { CurrencyShop, GemShop } = require("../../dbObjects");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Check the shop")
        .addSubcommand(subcommand =>
            subcommand
                .setName('moolah')
                .setDescription('Check the moolah shop!'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('gem')
                .setDescription('Check the gem shop!')),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'moolah') {
            const shopItems = await CurrencyShop.findAll();
            interaction.reply(codeBlock(shopItems.map(i => `${i.name}: ${i.cost}💰`).join('\n')));
        } else {
            const gemShopItems = await GemShop.findAll()
            interaction.reply(codeBlock(gemShopItems.map(i => `${i.name}: ${i.cost}💎`).join('\n')));
        }



    }
}