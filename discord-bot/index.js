const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Users } = require('./dbObjects.js');
const { token } = require('./config.json');
const currency = new Collection();
const dailyTimes = new Collection();
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
function addCache(id) {
    client.users.fetch(id)
}
client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    const storedBalances = await Users.findAll();
    const storedDailies = await Users.findAll();
    storedDailies.forEach(b => dailyTimes.set(b.user_id, b));
    storedBalances.forEach(b => currency.set(b.user_id, b));
    storedBalances.forEach(b => addCache(b.user_id));
});

client.login(token);
client.on(Events.InteractionCreate, async interaction => {
    const storedBalances = await Users.findAll();
    const storedDailies = await Users.findAll();
    storedDailies.forEach(b => dailyTimes.set(b.user_id, b));
    storedBalances.forEach(b => currency.set(b.user_id, b));
    addBalance(interaction.user.id, 0)

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
    const storedDailies = await Users.findAll();
    storedDailies.forEach(b => dailyTimes.set(b.user_id, b));
    addBalance(msg.author.id, 1)

    if (msg.content[0] === '-') {
        let messageArray = msg.content.split(" ");
        const command = messageArray[0].substring(1);
        switch (command) {
            case "give":
                if (msg.author.id == "295074068581974026") {
                    addBalance(messageArray[1], messageArray[2])
                } else {
                    msg.reply('nah')
                }
                break;
        }
    }
});


