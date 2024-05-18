const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const economy = require('../../importantfunctions/economy.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Gamble all your moolah on the roulette table!')
        .addIntegerOption(option =>
            option.setName("money-to-bet")
                .setDescription("Amount to bet on the roulette table")
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName("odds")
                .setDescription("Black or red: 2x, Green: 10x")
                .setRequired(true)),
    async execute(interaction) {
        economy.addExp(interaction.user.id, 5)
        let userBalance = economy.getBalance(interaction.user.id)
        let userOdds = interaction.options.get('odds').value
        let userBet = interaction.options.get('money-to-bet').value
        let randomNumber = 0;
        let win = false;
        if (userBalance < userBet) {
            interaction.reply({
                content: "You are trying to bet more than you own, try again!",
                components: [],
                ephemeral: true,
            });
        } else {
            if (!(((userOdds.toLowerCase() === "green")) || (userOdds.toLowerCase() === "black") || (userOdds.toLowerCase() === "red"))) {
                interaction.reply({
                    content: "You cannot bet on something that is not GREEN/RED/BLACK. Please try again.",
                    ephemeral: true,
                })
            } else {
                const response = await interaction.reply({
                    content: `You are betting ${userBet} on ${userOdds.toLowerCase()}. Spinning!`,
                    components: [],
                });
                await wait(1500)
                let count = 0
                let color = ""
                while (count < 30) {
                    randomNumber = Math.floor(Math.random() * 39);
                    if ((randomNumber === 0) || (randomNumber === 38)) {
                        color = 'GREEN'
                    } else if ((randomNumber >= 1) && (randomNumber <= 16)) {
                        color = 'RED'
                    } else if ((randomNumber >= 17) && (randomNumber <= 37)) {
                        color = 'BLACK'
                    }
                    await wait(200)
                    response.edit({
                        content: `Spinning:\nNUMBER: ${randomNumber}\nCOLOR: ${color}`
                    })
                    count++
                }
                await wait(3000)
                win = color.toLowerCase() === userOdds.toLowerCase();

                if (win) {
                    if ((color === "RED") || (color === "BLACK")) {
                        response.edit({
                            content: `Congrats! You won on ${userOdds.toLowerCase()}! You won ${userBet} moolah!`
                        })
                        economy.addBalance(interaction.user.id, userBet)
                    } else {
                        response.edit({
                            content: `Congrats! You won on ${userOdds.toLowerCase()}! You won ${userBet * 10} moolah!`
                        })
                        economy.addBalance(interaction.user.id, userBet * 10)
                    }
                } else {
                    response.edit({
                        content: `Sorry! It landed on ${color.toLowerCase()}, and you bet on ${userOdds.toLowerCase()}. You lost ${userBet} moolah!`
                    })
                    economy.addBalance(interaction.user.id, -userBet)
                }
            }
        }

    }
}