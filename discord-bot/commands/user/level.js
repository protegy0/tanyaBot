const { SlashCommandBuilder, Collection} = require('discord.js');
const { Users } = require('../../dbObjects')
const userInfo = new Collection()
const economy = require('../../importantfunctions/economy.js')
function calcLevel(experience) {
    let level = 1
    while (experience > (100 * level)**1.1) {
        level += 1
    }
    return level
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check your level'),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        let level = calcLevel(economy.getExp(interaction.user.id, userInfo))
        let experienceTillNextLvl = Math.ceil((100 * (level))**1.1)
        interaction.reply(`You are level ${level} with ${economy.getExp(interaction.user.id, userInfo)}/${experienceTillNextLvl} till the next level!`)

    }
}