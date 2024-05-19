const { SlashCommandBuilder} = require('discord.js');
const { exp} = require('../../importantfunctions/mutators.js')
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
        let level = calcLevel(exp.getExp(interaction.user.id))
        let experienceTillNextLvl = Math.ceil((100 * (level))**1.1)
        interaction.reply(`You are level ${level} with ${exp.getExp(interaction.user.id)}/${experienceTillNextLvl} till the next level!`)

    }
}