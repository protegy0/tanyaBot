const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { level, balance, exp, dailyTime, gems } = require('../../importantfunctions/mutators.js')

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
        exp.addExp(interaction.user.id, 50)
        const userTime = dailyTime.getDailyTimes(interaction.user.id);
        const userLevel = level.getLevel(interaction.user.id);
        if ((Date.now() - userTime) >= 86400000) {
            balance.addBalance(interaction.user.id, (100 + (userLevel * 2)))
            gems.addGems(interaction.user.id, 10)
            dailyTime.setDailyTime(interaction.user.id)
            const dailyEmbed = new EmbedBuilder()
                .setColor('#106078')
                .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                .addFields(
                    {name: 'Daily moolah claimed!', value: `${100 + userLevel * 2} 💰`},
                    {name: 'Daily gems claimed!', value: `10 💎`}
                )

            interaction.reply({
                embeds: [dailyEmbed],
            })
        } else {
            interaction.reply({
                content:`You've already claimed your daily! Come back in ${msToTime(86400000 - (Date.now() - userTime))}`,
                ephemeral: true,
            });
        }


    }

}