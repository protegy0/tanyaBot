const { SlashCommandBuilder, Collection } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()

function getBalance(id) {
    const user = userInfo.get(id);
    return user ? user.balance : 0;
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
async function addExp(id, amount) {
    const user = userInfo.get(id);
    if (user) {
        user.experience += Number(amount);
        return user.save();
    }
    const newUser = await Users.create({ user_id: id, experience: amount });
    userInfo.set(id, newUser);
    return newUser;
}

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
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        addExp(interaction.user.id, 5)
        let userBalance = getBalance(interaction.user.id)
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
                        addBalance(interaction.user.id, userBet)
                    } else {
                        response.edit({
                            content: `Congrats! You won on ${userOdds.toLowerCase()}! You won ${userBet * 10} moolah!`
                        })
                        addBalance(interaction.user.id, userBet * 10)
                    }
                } else {
                    response.edit({
                        content: `Sorry! It landed on ${color.toLowerCase()}, and you bet on ${userOdds.toLowerCase()}. You lost ${userBet} moolah!`
                    })
                    addBalance(interaction.user.id, -userBet)
                }
            }
        }

    }
}