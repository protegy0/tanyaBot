const { SlashCommandBuilder, Collection} = require('discord.js');
const { Users } = require('../../dbObjects')
const userInfo = new Collection()
function calcLevel(experience) {
    let level = 1
    while (experience > (100 * level)**1.1) {
        level += 1
    }
    return level
}
function getExp(id) {
    const user = userInfo.get(id);
    return user ? user.experience : 0;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check your level'),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        let level = calcLevel(getExp(interaction.user.id))
        let experienceTillNextLvl = Math.ceil((100 * (level))**1.1)
        interaction.reply(`You are level ${level} with ${getExp(interaction.user.id)}/${experienceTillNextLvl} till the next level!`)

    }
}