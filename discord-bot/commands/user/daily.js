const { SlashCommandBuilder } = require('discord.js');
const economy = require('../../importantfunctions/economy.js')

function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + " seconds";
    else if (minutes < 60) return minutes + " minutes";
    else if (hours < 24) return hours + " hours";
    else return days + " days"
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily moolah!'),
    async execute(interaction) {
        economy.addExp(interaction.user.id, 50)
        const userTime = economy.getDailyTimes(interaction.user.id);
        if ((Date.now() - userTime) >= 86400000) {
            economy.addBalance(interaction.user.id, 100)
            economy.setDailyTime(interaction.user.id)
            interaction.reply("You got 100 moolah!")
        } else {
            interaction.reply({
                content:`You've already claimed your daily! Come back in ${msToTime(86400000 - (Date.now() - userTime))}`,
                ephemeral: true,
            });
        }


    }

}