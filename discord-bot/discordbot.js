require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({intents : [
                                                            GatewayIntentBits.Guilds,
                                                            GatewayIntentBits.GuildMessages,
                                                            GatewayIntentBits.MessageContent,
                                                            GatewayIntentBits.GuildMembers
                                                            ] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    });

client.login('');

client.on('messageCreate', msg => {
    console.log(msg.author.username + " typed: " + msg.content);
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
                const numbers = messageArray[1].split(",")
                const sum = parseInt(numbers[0]) + parseInt(numbers[1]);
                if (isNaN(sum)) {
                    msg.reply("Something other than a number was provided.")
                } else {
                    msg.reply(`Sum of numbers is ${sum}`);
                }

        }

    }
});
