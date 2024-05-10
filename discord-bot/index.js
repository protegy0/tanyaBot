const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, codeBlock } = require('discord.js');
const { Users, CurrencyShop } = require('./dbObjects.js');
const { token } = require('./config.json');
const Op = require('sequelize');
const Booru = require('booru');
const malScraper = require('mal-scraper');
const search = malScraper.search
const currency = new Collection();









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
    const user = currency.get(id);

    if (user) {
        user.balance += Number(amount);
        return user.save();
    }

    const newUser = await Users.create({ user_id: id, balance: amount });
    currency.set(id, newUser);

    return newUser;
}

function getBalance(id) {
    const user = currency.get(id);
    return user ? user.balance : 0;
}




client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);

client.on(Events.InteractionCreate, async interaction => {
    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => currency.set(b.user_id, b));
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
    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => currency.set(b.user_id, b));
    addBalance(msg.author.id, 1)
    if (msg.content[0] === '-') {
        let messageArray = msg.content.split(" ");
        const command = messageArray[0].substring(1);
        switch (command) {
            case "help":
                console.log(`${msg.author.username} sent command ${command}`);
                msg.reply('hlep')




                break;
            case "hello":
                console.log(`${msg.author.username} sent command ${command}`);
                msg.reply(`Hello ${msg.author.username}`);
                break;
            case "math":
                console.log(`${msg.author.username} sent command ${command}`);
                msg.reply(`I love math!`);
                break;
            case "add":
                console.log(`${msg.author.username} sent command ${command}`);
                const numbers = messageArray[1].split(",");
                const sum = parseInt(numbers[0]) + parseInt(numbers[1]);
                if (isNaN(sum)) {
                    msg.reply("Something other than a number was provided.");
                } else {
                    msg.reply(`Sum of numbers is ${sum}`);
                }
                break;
            case "coinflip":
                const flip = Math.random();
                if (flip > 0.5) {
                    msg.reply("Heads!")
                } else {
                    msg.reply("Tails!")
                }
                break;
            case "anime":
                let name = ""
                messageArray.shift()
                for (let string of messageArray) {
                    name = name + string + " "
                }
                console.log(name)

                malScraper.getInfoFromName(name).then(
                    (data) => msg.reply(`**${data.title}**\n\n${data.picture}\n${data.synopsis}`),
                )
                let counter = 0
                search.search("anime", {
                    maxResults: 5,
                    has: 5,
                    term: name,

                }).then(animes => {
                    for (let anime of animes) {
                        console.log(anime.title)
                        counter++
                    }
                    console.log(`Number of animes = ${counter}\n`)
                })


                break;


            case "inventory":
                const target = msg.author.id
                const user = await Users.findOne({ where: { user_id: (target) } });
                const items = await user.getItems();

                if (!items.length) {
                    msg.reply(`${msg.author.username} has absolutely nothing!`);
                } else {
                    msg.reply(`${msg.author.username} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
                }
                break;

            case "shop":
                const shopItems = await CurrencyShop.findAll();
                msg.reply(codeBlock(shopItems.map(i => `${i.name}: ${i.cost}💰`).join('\n')));
                break;




        }


    }
});


