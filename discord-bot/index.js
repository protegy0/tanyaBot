const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

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
        let messageArray = msg.content.split(" ");
        const command = messageArray[0].substring(1);
        switch (command) {
            case "help":
                console.log(`${msg.author.username} sent command ${command}`);
                msg.reply(`yes\nhelp\nha!`);
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
            case "tanya":
                console.log(`${msg.author.username} sent command ${command}`);
                Booru.search('safebooru', ['tanya_degurechaff', 'solo'], {limit : 1, random: true}).then(
                    posts => {
                        for (let post of posts) msg.reply(post.fileUrl)

                    },
                )
                break;
            case "makima":
                console.log(`${msg.author.username} sent command ${command}`);
                Booru.search('safebooru', ['makima_(chainsaw_man)', 'solo'], {limit : 1, random: true}).then(
                    posts => {
                        for (let post of posts) msg.reply(post.fileUrl)

                    },
                )
                break;
            case "frieren":
                console.log(`${msg.author.username} sent command ${command}`);
                Booru.search('safebooru', ['frieren', 'solo'], {limit : 1, random: true}).then(
                    posts => {
                        for (let post of posts) msg.reply(post.fileUrl)

                    },
                )
                break;
            case "picture":
                messageArray = messageArray.slice(1)
                let newQuery = ""
                for (let string of messageArray) {
                    newQuery = newQuery + string + "_"
                }
                newQuery = newQuery.slice(0, -1);
                console.log(`${msg.author.username} sent command ${command} and queried ${newQuery}`);
                Booru.search('safebooru', [newQuery, 'solo'], {limit : 1, random: true}).then(
                    posts => {
                        if (posts.length === 0) {
                            newQuery = ""
                            const temp = messageArray[0]
                            messageArray[0] = messageArray[1]
                            messageArray[1] = temp
                            for (let string of messageArray) {
                                newQuery = newQuery + string + "_"
                            }
                            newQuery = newQuery.slice(0, -1);
                            Booru.search('safebooru', [newQuery, 'solo'], {limit: 1, random: true}).then(
                                posts => {
                                        if (posts.length === 0) {
                                            msg.reply('Query either does not exist or is formatted incorrectly')
                                        } else {
                                            for (let post of posts) msg.reply(post.fileUrl)
                                        }

                                }
                            );

                        } else {
                            for (let post of posts) msg.reply(post.fileUrl)
                        }
                    }
                )
                break;
            case "coinflip":
                const flip = Math.random();
                if (flip > 0.5) {
                    msg.reply("Heads!")
                } else {
                    msg.reply("Tails!")
                }
                break;

        }


    }
});


