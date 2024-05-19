const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Users } = require('./dbObjects.js');
const { token } = require('./config.json');
const { balance, level, exp, gems} = require('./importantfunctions/mutators.js')
const userInfo = new Collection();
const { EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [
                                                            GatewayIntentBits.Guilds,
                                                            GatewayIntentBits.GuildMessages,
                                                            GatewayIntentBits.MessageContent,
                                                            GatewayIntentBits.GuildMembers,
                                                            GatewayIntentBits.GuildMessageReactions,
                                                            ] });
client.commands = new Collection();

//Find command specified and run it
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
    await balance.addBalance(interaction.user.id, 0)
    const time = new Date().toLocaleString();
    console.log(`${interaction.user.username} ran command ${interaction.commandName} in ${interaction.channel.name} on ${time}`)

    //Level calculation
    let calculatedLevel = level.calcLevel(exp.getExp(interaction.user.id))
    let storedLevel = level.getLevel(interaction.user.id)
    if (calculatedLevel > storedLevel) {
        let gemReward = calculatedLevel * 5
        const channel = interaction.channelId
        client.channels.cache.get(channel).send(`<@${interaction.user.id}> leveled up to level ${calculatedLevel}! You earned ${gemReward} gems!`)
        await gems.addGems(interaction.user.id, gemReward)
        await level.increaseLevel(interaction.user.id)
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






const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Some title')
    .setURL('https://discord.js.org/')
    .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
    .setImage('https://i.imgur.com/AfFp7pu.png')
    .setTimestamp()
    .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });


client.on("messageCreate", async msg => {
    if (msg.author.bot) return;
    const storedUserInfo = await Users.findAll();
    storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
    storedUserInfo.forEach(b => addCache(b.user_id));
    await exp.addExp(msg.author.id, 1)

    let calculatedLevel = level.calcLevel(exp.getExp(msg.author.id))
    let storedLevel = level.getLevel(msg.author.id)
    if (calculatedLevel > storedLevel) {
        let gemReward = calculatedLevel * 5
        await msg.reply(`You leveled up to level ${calculatedLevel}! You earned ${gemReward} gems!`)
        await gems.addGems(msg.author.id, gemReward)
        await level.increaseLevel(msg.author.id)
    }


    if (msg.content[0] === '-') {
        let messageArray = msg.content.split(" ");
        const command = messageArray[0].substring(1);
        if (msg.author.id.toString() === "295074068581974026") {
            switch (command) {
                case "test":
                    msg.reply({embeds: [exampleEmbed]})
                    break;
            }
        }
    }
});


