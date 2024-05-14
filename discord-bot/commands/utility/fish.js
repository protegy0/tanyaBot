const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users, CurrencyShop, FindDatabase } = require('../../dbObjects.js');
const {Op} = require("sequelize");
const userInfo = new Collection()
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fish")
        .setDescription("Fish and hopefully make some moolah while you're at it!")
        .addStringOption(option =>
            option.setName("bait")
                .setDescription("The bait to use. Better bait is well.. better!")
                .setRequired(true)
                .addChoices(
                    { name: "Dirty Bait", value: 'dirty'},
                    { name: "Clean Bait", value: 'clean'},
                    { name: "Great Bait", value: 'great'},
                )),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        let randomNumber = 0
        const userId = interaction.user.id
        addExp(userId, 10)
        const user = await Users.findOne({ where: { user_id: (userId) } });
        const items = await user.getItems();
        let amountDirtyBait = ""
        let amountGreatBait = ""
        let amountCleanBait = ""
        items.map(i => {
            if (i.item.name === "Dirty Bait") {
                amountDirtyBait = i.amount
            } else if (i.item.name === "Great Bait") {
                amountGreatBait = i.amount
            } else if (i.item.name === "Clean Bait") {
                amountCleanBait = i.amount
            }
        })
        let enoughBait = false;
        const request = interaction.options.get('bait').value
        let itemName = ''
        switch (request) {
            case 'dirty':
                itemName = 'Dirty Bait'
                randomNumber = Math.floor(Math.random() * 1000) + 1;
                break;
            case 'clean':
                itemName = 'Clean Bait'
                randomNumber = Math.floor(Math.random() * 851) + 150;
                break;
            case 'great':
                itemName = 'Great Bait'
                randomNumber = Math.floor(Math.random() * (751)) + 250;
                break;
        }
        const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });

        if (request === 'dirty') {
            enoughBait = parseInt(amountDirtyBait) > 0;
        } else if (request === 'clean') {
            enoughBait = parseInt(amountCleanBait) > 0;
        } else if (request === 'great') {
            enoughBait = parseInt(amountGreatBait) > 0;
        }

        if (enoughBait) {
            if (randomNumber < 600) {
                interaction.reply('Congrats! You pulled out a 🥾, you got 1 moolah!')
                addBalance(userId, 1)
                const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🥾' } } });
                await user.addFind(find)
            } else if ((randomNumber < 900) && (randomNumber > 500)) {
                interaction.reply('Congrats! You pulled out a 🐟, you got 5 moolah!')
                addBalance(userId, 5)
                const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🐟' } } });
                await user.addFind(find)
            } else if ((randomNumber < 940) && (randomNumber > 900)) {
                interaction.reply('Congrats! You pulled out a 🐠, you got 15 moolah!')
                addBalance(userId, 15)
                const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🐠' } } });
                await user.addFind(find)
            } else if ((randomNumber < 960) && (randomNumber > 940)) {
                interaction.reply('Congrats, you pulled out a 🦈, you got 30 moolah!')
                addBalance(userId, 30)
                const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🦈' } } });
                await user.addFind(find)
            } else if ((randomNumber < 980) && (randomNumber > 960)) {
                interaction.reply('Congrats, you pulled out a 🐙, you got 75 moolah!')
                addBalance(userId, 75)
                const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🐙' } } });
                await user.addFind(find)
            } else if ((randomNumber < 995) && (randomNumber > 980)) {
                interaction.reply(`Congrats, you got a... WHAT??? How'd you manage to get a 👶?? Here's 300 moolah for finding a lost child.`)
                addBalance(userId, 300)
                const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '👶 fished out of water' } } });
                await user.addFind(find)
            } else if ((randomNumber < 999) && (randomNumber > 995)) {
                interaction.reply(`You fished out an... entire... plane ✈️ ..? In perfect condition? Well.. here's 1500 moolah I guess..`)
                addBalance(userId, 1500)
                const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '✈️' } } });
                await user.addFind(find)
            } else if (randomNumber === 1000) {
                interaction.reply(`You managed to find one of the 🌠 shooting stars that fell in this river many years ago... somehow.. Have 5000 moolah!`)
                addBalance(userId, 5000)
                const find = await FindDatabase.findOne({ where: { name: { [Op.like]: '🌠' } } });
                await user.addFind(find)
            }
            user.removeItem(item)
        } else {
            interaction.reply({
                content: `You don't have enough of this type of bait!`,
                ephemeral: true,
            })
        }


    }
}