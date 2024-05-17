const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Users } = require('./dbObjects.js');
const { token } = require('./config.json');
const malScraper = require("mal-scraper");
const economy = require('./importantfunctions/economy.js')
const userInfo = new Collection();
const client = new Client({ intents: [
                                                            GatewayIntentBits.Guilds,
                                                            GatewayIntentBits.GuildMessages,
                                                            GatewayIntentBits.MessageContent,
                                                            GatewayIntentBits.GuildMembers,
                                                            GatewayIntentBits.GuildMessageReactions,
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
    await economy.addBalance(interaction.user.id, 0, userInfo)

    let calculatedLevel = economy.calcLevel(economy.getExp(interaction.user.id, userInfo))
    let storedLevel = economy.getLevel(interaction.user.id, userInfo)
    if (calculatedLevel > storedLevel) {
        let gemReward = calculatedLevel * 5
        const channel = interaction.channelId
        client.channels.cache.get(channel).send(`<@${interaction.user.id}> leveled up to level ${calculatedLevel}! You earned ${gemReward} gems!`)
        await economy.addGems(interaction.user.id, gemReward, userInfo)
        await economy.increaseLevel(interaction.user.id, userInfo)
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
    await economy.addExp(msg.author.id, 1, userInfo)

    let calculatedLevel = economy.calcLevel(economy.getExp(msg.author.id, userInfo))
    let storedLevel = economy.getLevel(msg.author.id, userInfo)
    if (calculatedLevel > storedLevel) {
        let gemReward = calculatedLevel * 5
        await msg.reply(`You leveled up to level ${calculatedLevel}! You earned ${gemReward} gems!`)
        await economy.addGems(msg.author.id, gemReward, userInfo)
        await economy.increaseLevel(msg.author.id, userInfo)
    }


    if (msg.content[0] === '-') {
        let messageArray = msg.content.split(" ");
        const command = messageArray[0].substring(1);
        if (msg.author.id == "295074068581974026") {
            switch (command) {
                case "maltest":
                    malScraper.getResultsFromSearch(messageArray[1]).then(
                        (data) => {for (let i of data) {
                            console.log(i.name)
                        }}
                    )
                    break;
        }





        }
    }
});


