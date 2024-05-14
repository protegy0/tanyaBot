const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Users, CurrencyShop } = require('./dbObjects.js');
const { token } = require('./config.json');
const { Op } = require('sequelize')
const userInfo = new Collection();
const currency = new Collection();
const dailyTimes = new Collection();
const stealTimes = new Collection()
const client = new Client({ intents: [
                                                            GatewayIntentBits.Guilds,
                                                            GatewayIntentBits.GuildMessages,
                                                            GatewayIntentBits.MessageContent,
                                                            GatewayIntentBits.GuildMembers
                                                            ] });
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
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
async function addGems(id, amount) {
    const user = userInfo.get(id);
    if (user) {
        user.gems += Number(amount);
        return user.save();
    }
    const newUser = await Users.create({ user_id: id, gems: amount });
    userInfo.set(id, newUser);
    return newUser;
}
async function increaseLevel(id) {
    const user = userInfo.get(id);
    if (user) {
        user.level += 1;
        return user.save();
    }
    const newUser = await Users.create({ user_id: id, level: 1 });
    userInfo.set(id, newUser);
    return newUser;
}
function calcLevel(experience) {
    let level = 1
    while ((experience > (100 * level)**1.1)) {
        level += 1
    }
    return level
}
function getExp(id) {
    const user = userInfo.get(id);
    return user ? user.experience : 0;
}
function getLevel(id) {
    const user = userInfo.get(id);
    return user ? user.level : 1;
}
function addCache(id) {
    client.users.fetch(id)
}
client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    const storedUserInfo = await Users.findAll();
    storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
    storedUserInfo.forEach(b => addCache(b.user_id));


});

client.login(token);
client.on(Events.InteractionCreate, async interaction => {
    const storedUserInfo = await Users.findAll();
    storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
    storedUserInfo.forEach(b => addCache(b.user_id));
    addBalance(interaction.user.id, 0)



    let calculatedLevel = calcLevel(getExp(interaction.user.id))
    let storedLevel = getLevel(interaction.user.id)
    if (calculatedLevel > storedLevel) {
        let gemReward = calculatedLevel * 5
        const channel = interaction.channelId
        client.channels.cache.get(channel).send(`<@${interaction.user.id}> leveled up to level ${calculatedLevel}! You earned ${gemReward} gems!`)
        addGems(interaction.user.id, gemReward)
        increaseLevel(interaction.user.id)
    }




    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.on("messageCreate", async msg => {
    if (msg.author.bot) return;
    const storedUserInfo = await Users.findAll();
    storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
    storedUserInfo.forEach(b => addCache(b.user_id));
    addExp(msg.author.id, 1)

    let calculatedLevel = calcLevel(getExp(msg.author.id))
    let storedLevel = getLevel(msg.author.id)
    if (calculatedLevel > storedLevel) {
        let gemReward = calculatedLevel * 5
        msg.reply(`You leveled up to level ${calculatedLevel}! You earned ${gemReward} gems!`)
        addGems(msg.author.id, gemReward)
        increaseLevel(msg.author.id)
    }





    if (msg.content[0] === '-') {
        let messageArray = msg.content.split(" ");
        const command = messageArray[0].substring(1);
        switch (command) {
            case "give":
                if (msg.author.id == "295074068581974026") {
                    addBalance(messageArray[1], messageArray[2])
                    msg.delete()
                } else {
                    msg.reply('nah')
                }
                break;
            case "exptest":
                let expAmount = getExp(msg.author.id)
                msg.reply(`${expAmount}`)
                break;




        }
    }
});


