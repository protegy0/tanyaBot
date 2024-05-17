const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
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
        .setName('steal')
        .setDescription('Attempt to steal moolah')
        .addMentionableOption(option =>
            option.setName('person')
                .setDescription('Person to steal from')
                .setRequired(true)),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        const userTime = economy.getStealTimes(interaction.user.id, userInfo);
        const victimBalance = economy.getBalance(interaction.options.get('person').value, userInfo)
        const stealAmount = Math.floor(Math.random() * (victimBalance/4 + 1))
        const retributionAmount = Math.floor(Math.random() * ((economy.getBalance(interaction.user.id, userInfo)/7) + 1))
        const randomNumber = Math.random()
        economy.addExp(interaction.user.id, 50, userInfo)
        if ((Date.now() - userTime) >= 86400000) {
            if (randomNumber > 0.85) {
                economy.addBalance(interaction.user.id, stealAmount, userInfo)
                economy.addBalance(interaction.options.get('person').value, -stealAmount, userInfo)
                interaction.reply(`You managed to steal ${stealAmount} moolah from <@${interaction.options.get('person').value}>! Sucks to be them...`)
            } else {
                interaction.reply(`<@${interaction.options.get('person').value}> caught you in the act and beat ${retributionAmount} moolah out of you!`)
            }
            economy.setStealTime(interaction.user.id, userInfo)
        } else {
            interaction.reply({
                content:`You've already attempted to steal! Come back in ${msToTime(86400000 - (Date.now() - userTime))}`,
                ephemeral: true,
            });
        }


    }

}