const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()

function getStealTimes(id) {
    const user = userInfo.get(id);
    return user ? user.time_since_steal : 0;
}
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
async function setStealTime(id) {
    const user = userInfo.get(id);

    if (user) {
        user.time_since_steal = Date.now()
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
        .setName('steal')
        .setDescription('Attempt to steal moolah')
        .addMentionableOption(option =>
            option.setName('person')
                .setDescription('Person to steal from')
                .setRequired(true)),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        const userTime = getStealTimes(interaction.user.id);
        const victimBalance = getBalance(interaction.options.get('person').value)
        const stealAmount = Math.floor(Math.random() * (victimBalance/4 + 1))
        const retributionAmount = Math.floor(Math.random() * ((getBalance(interaction.user.id)/7) + 1))
        const randomNumber = Math.random()
        addExp(interaction.user.id, 50)
        if ((Date.now() - userTime) >= 86400000) {
            if (randomNumber > 0.85) {
                addBalance(interaction.user.id, stealAmount)
                addBalance(interaction.options.get('person').value, -stealAmount)
                interaction.reply(`You managed to steal ${stealAmount} moolah from <@${interaction.options.get('person').value}>! Sucks to be them...`)
            } else {
                interaction.reply(`<@${interaction.options.get('person').value}> caught you in the act and beat ${retributionAmount} moolah out of you!`)
            }
            setStealTime(interaction.user.id)
        } else {
            interaction.reply({
                content:`You've already attempted to steal! Come back in ${msToTime(86400000 - (Date.now() - userTime))}`,
                ephemeral: true,
            });
        }


    }

}