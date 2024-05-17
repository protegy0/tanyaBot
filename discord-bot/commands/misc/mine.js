const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users, FindDatabase } = require('../../dbObjects.js');
const {Op} = require("sequelize");
const userInfo = new Collection()
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
        addExp(interaction.user.id, 5)
        if (randomNumber < 9500) {
            interaction.reply('You went to the mines, and came back with 💩. You sold it for 1 moolah.')
            addBalance(userId, 1)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '💩' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9700) && (randomNumber > 9500)) {
            interaction.reply('You went to the mines, and came back with some glass shards! You sold them for 2 moolah.')
            addBalance(userId, 2)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: 'Glass Shards' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9800) && (randomNumber > 9700)) {
            interaction.reply('You went to the mines, and came back with a pretty hard rock. You sold it for 3 moolah.')
            addBalance(userId, 3)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: 'Hard Rock' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9875) && (randomNumber > 9800)) {
            interaction.reply('You went to the mines, and came back with a 🧱! You sold it to the local stonemason for 5 moolah.')
            addBalance(userId, 5)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🧱' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9925) && (randomNumber > 9875)) {
            interaction.reply('You went to the mines, and came back with... :wood: ?.. You sold it to the local lumberjack for 7 moolah.')
            addBalance(userId, 7)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: 'Wood' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9965) && (randomNumber > 9925)) {
            interaction.reply(`You went to the mines and came back with... a 👶?! Where do people leave their children nowadays? The local orphanage gave you 10 moolah and a pat on the back.`)
            addBalance(userId, 10)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '👶 found in mine' } } });
            await user.addFind(find)
        } else if ((randomNumber < 9999) && (randomNumber > 9965)) {
            interaction.reply(`You went to the mines and came back with... a 💎! Incredible find! You sold it for 300 moolah!`)
            addBalance(userId, 300)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '💎' } } });
            await user.addFind(find)
        } else if (randomNumber === 10000) {
            interaction.reply(`You went to the mines and found one of the 🌠 shooting star fragments that fell in this area years ago... somehow.. Have 1500 moolah!`)
            addBalance(userId, 1500)
            const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🌠 fragment' } } });
            await user.addFind(find)
        }
    }
}