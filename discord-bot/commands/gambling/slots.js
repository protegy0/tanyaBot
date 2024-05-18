const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const economy = require('../../importantfunctions/economy.js')

function slot() {
    let randomNumber = Math.floor(Math.random() * 1000) + 1;
    if (randomNumber < 500) {
        return "🍒"
    } else if (randomNumber < 700 && randomNumber > 500) {
        return "🍎"
    } else if (randomNumber < 900 && randomNumber > 700) {
        return "⭐"
    } else if (randomNumber < 975 && randomNumber > 900) {
        return "💎"
    } else if (randomNumber <= 1000 && randomNumber > 975) {
        return "7️⃣"
    }
}
const allEqual = arr => arr.every(val => val === arr[0]);
function slotReturn(slots) {
    if (allEqual(slots)) {
        switch (slots[0]) {
            case "🍒":
                return 25;
            case "🍎":
                return 50;
            case "⭐":
                return 1000;
            case "💎":
                return 5000;
            case "7️⃣":
                return 50000;
        }
    } else if ((slots[0] === slots[1]) || (slots[0] === slots[2])) {
        switch (slots[0]) {
            case "🍒":
                return 3;
            case "🍎":
                return 8;
            case "⭐":
                return 15;
            case "💎":
                return 30;
            case "7️⃣":
                return 50;
        }
    } else if (slots[1] === slots[2]) {
        switch (slots[1]) {
            case "🍒":
                return 3;
            case "🍎":
                return 8;
            case "⭐":
                return 15;
            case "💎":
                return 30;
            case "7️⃣":
                return 50;
        }
    } else {
        return 1
    }
}
let slotOne = ''
let slotTwo = ''
let slotThree = ''
let slots = [slotOne, slotTwo, slotThree]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Spend 5 moolah to get more moolah! (Hopefully)'),
    async execute(interaction) {
        economy.addExp(interaction.user.id, 5)
        if (economy.getBalance(interaction.user.id) < 5) {
            interaction.reply("It costs 5 moolah to play, you don't have enough!")
        } else {
            economy.addBalance(interaction.user.id, -5)
            const response = await interaction.reply({
                content: `Spinning!`,
                components: [],
            });
            await wait(500)
            for (let i = 0; i < 10; i++) {
                slots[0] = slot()
                slots[1] = slot()
                slots[2] = slot()
                await wait(250)
                response.edit({
                    content: `${slots[0]} ${slots[1]} ${slots[2]}`
                })
            }
            let amount = slotReturn(slots)
            economy.addBalance(interaction.user.id, amount)
            response.edit(`Landed on ${slots[0]} ${slots[1]} ${slots[2]}!\nYou made ${amount} moolah!`)
        }
    }
}