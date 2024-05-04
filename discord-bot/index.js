const fs = require('node:fs');
const https = require('https');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, apiKey, login } = require('./config.json');

const Booru = require('booru');


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





client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);

client.on(Events.InteractionCreate, async interaction => {
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
    if (msg.content[0] === '-') {
        const messageArray = msg.content.split(" ");
        const command = messageArray[0].substring(1);
        switch (command) {
            case "help":
                msg.reply(`Help given:`);
                break;
            case "hello":
                msg.reply(`Hello ${msg.author.username}`);
                break;
            case "math":
                msg.reply(`I love math!`);
                break;
            case "add":
                const numbers = messageArray[1].split(",");
                const sum = parseInt(numbers[0]) + parseInt(numbers[1]);
                if (isNaN(sum)) {
                    msg.reply("Something other than a number was provided.");
                } else {
                    msg.reply(`Sum of numbers is ${sum}`);
                }
                break;
            case "tanya":
                Booru.search('safebooru', ['tanya_degurechaff', 'solo'], {limit : 1, random: true}).then(
                    posts => {
                        for (let post of posts) msg.reply(post.fileUrl)

                    },
                )
                break;
        }
    }
});


