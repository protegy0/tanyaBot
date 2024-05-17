const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users, FindDatabase } = require('../../dbObjects.js');
const {Op} = require("sequelize");
const userInfo = new Collection()
const economy = require('../../importantfunctions/economy.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mine")
        .setDescription("Spend some time in the mine and earn moolah"),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        const randomNumber = Math.floor(Math.random() * 10000) + 1;
        const userId = interaction.user.id
        const user = await Users.findOne({ where: { user_id: (userId) } });
        economy.addExp(interaction.user.id, 5, userInfo)
        if (randomNumber < 9500) {
            interaction.reply('You went to the mines, and came back with 💩. You sold it for 1 moolah.')
            economy.addBalance(userId, 1, userInfo)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '💩' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9700) && (randomNumber > 9500)) {
            interaction.reply('You went to the mines, and came back with some glass shards! You sold them for 2 moolah.')
            economy.addBalance(userId, 2, userInfo)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: 'Glass Shards' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9800) && (randomNumber > 9700)) {
            interaction.reply('You went to the mines, and came back with a pretty hard rock. You sold it for 3 moolah.')
            economy.addBalance(userId, 3, userInfo)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: 'Hard Rock' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9875) && (randomNumber > 9800)) {
            interaction.reply('You went to the mines, and came back with a 🧱! You sold it to the local stonemason for 5 moolah.')
            economy.addBalance(userId, 5, userInfo)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🧱' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9925) && (randomNumber > 9875)) {
            interaction.reply('You went to the mines, and came back with... :wood: ?.. You sold it to the local lumberjack for 7 moolah.')
            economy.addBalance(userId, 7, userInfo)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: 'Wood' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9965) && (randomNumber > 9925)) {
            interaction.reply(`You went to the mines and came back with... a 👶?! Where do people leave their children nowadays? The local orphanage gave you 10 moolah and a pat on the back.`)
            economy.addBalance(userId, 10, userInfo)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '👶 found in mine' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9999) && (randomNumber > 9965)) {
            interaction.reply(`You went to the mines and came back with... a 💎! Incredible find! You sold it for 300 moolah!`)
            economy.addBalance(userId, 300, userInfo)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '💎' } } });
            await user.addFind(find)
        } else if (randomNumber === 10000) {
            interaction.reply(`You went to the mines and found one of the 🌠 shooting star fragments that fell in this area years ago... somehow.. Have 1500 moolah!`)
            economy.addBalance(userId, 1500, userInfo)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🌠 fragment' } } });
            await user.addFind(find)
        }
    }
}