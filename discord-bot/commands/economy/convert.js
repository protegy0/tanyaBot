const { SlashCommandBuilder } = require('discord.js');
const { balance, gems} = require('../../importantfunctions/mutators.js')


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
        const userId = interaction.user.id;
        const amount = interaction.options.get('amount').value
        if (gems.getGems(userId) >= amount) {
            gems.addGems(userId, -amount);
            balance.addBalance(userId, (amount * 25));
            interaction.reply(`Converted ${amount} gems to ${amount * 25} moolah!`)
        } else {
            interaction.reply({
                content: `You don't have enough gems to do that.`,
                ephemeral: true,
            })
        }
    }
}