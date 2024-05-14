const { SlashCommandBuilder, Collection} = require('discord.js');
const userInfo = new Collection()



module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin!'),
    async execute(interaction) {
        const flip = Math.random()
        if (flip > 0.5) {
            interaction.reply("You got heads!")
        } else {
            interaction.reply("You got tails!")
        }
    }
}