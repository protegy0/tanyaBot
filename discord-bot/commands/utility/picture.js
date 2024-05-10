const Booru = require('booru');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('picture')
        .setDescription('Provides a picture of the given character')
        .addStringOption(option =>
            option.setName('character-name')
                .setDescription('The name of the character')
                .setRequired(true)),
    async execute(interaction) {
        console.log(`${interaction.user.username} ran command ${interaction.commandName}.`)
        let query = interaction.options.get('character-name').value
        let queryArray = query.split(' ');
        let temp = queryArray[0]
        let newQuery = ""
        queryArray[0] = queryArray[1]
        queryArray[1] = temp
        for (let str of queryArray) {
            newQuery = newQuery + str + "_"
        }
        newQuery = newQuery.slice(0, -1)
        Booru.search('safebooru', [query.replaceAll(" ", "_"), 'solo'], {limit: 1, random: true}).then(
            posts => {
                if (posts.length === 0) {
                    Booru.search('safebooru', [newQuery, 'solo'], {limit: 1, random: true}).then(
                        posts => {
                            if (posts.length === 0) {
                                interaction.reply('Query either does not exist or is formatted incorrectly')
                            } else {
                                for (let post of posts) interaction.reply(post.fileUrl)
                            }
                        }
                    )
                } else {
                    for (let post of posts) interaction.reply(post.fileUrl)
                }
            },
        )

    },
}
