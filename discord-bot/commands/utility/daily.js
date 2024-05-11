const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const dailyTimes = new Collection()
const currency = new Collection()

function getDailyTimes(id) {
    const user = dailyTimes.get(id);
    return user ? user.time_since_daily : 0;
}
async function addBalance(id, amount) {
    const user = currency.get(id);

    if (user) {
        user.balance += Number(amount);
        return user.save();
    }

    const newUser = await Users.create({ user_id: id, balance: amount });
    currency.set(id, newUser);

    return newUser;
}
async function setDailyTime(id) {
    const user = dailyTimes.get(id);

    if (user) {
        user.time_since_daily = Date.now()
        return user.save();
    }


}

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
        const storedDailies = await Users.findAll();
        storedDailies.forEach(b => dailyTimes.set(b.user_id, b));
        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => currency.set(b.user_id, b));

        const userTime = getDailyTimes(interaction.user.id);
        if ((Date.now() - userTime) >= 86400000) {
            addBalance(interaction.user.id, 100)
            setDailyTime(interaction.user.id)
            interaction.reply("You got 100 moolah!")
        } else {
            interaction.reply({
                content:`You've already claimed your daily! Come back in ${msToTime(86400000 - (Date.now() - userTime))}`,
                ephemeral: true,
            });
        }


    }

}