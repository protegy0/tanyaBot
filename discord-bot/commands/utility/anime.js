const { SlashCommandBuilder, codeBlock} = require('discord.js');
const malScraper = require('mal-scraper');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Provides information on the anime given')
        .addStringOption(option =>
            option.setName('anime')
                .setDescription('The name of the anime')
                .setRequired(true)),
    async execute(interaction) {
        console.log(`${interaction.user.username} ran command ${interaction.commandName}.`)
        malScraper.getResultsFromSearch(interaction.options.get('anime').value).then(
            async (data) => {
                let count = 1
                let searchArray = []
                for (let i of data) {
                    searchArray.push(i.name)
                }
                const response = await interaction.reply({
                    content: codeBlock(searchArray.map(i => `(${count++}) ${i}`).join('\n')),
                    fetchReply: true,
                })
                const collectorFilter = (reaction, user) => {
                    return ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'].includes(reaction.emoji.name) && user.id === interaction.user.id
                };
                response.react('1️⃣')
                    .then(() => response.react('2️⃣'))
                    .then(() => response.react('3️⃣'))
                    .then(() => response.react('4️⃣'))
                    .then(() => response.react('5️⃣'))
                    .then(() => response.react('6️⃣'))
                    .then(() => response.react('7️⃣'))
                    .then(() => response.react('8️⃣'))
                    .then(() => response.react('9️⃣'))
                    .then(() => response.react('🔟'))
                    .then(() => {
                        response.awaitReactions({filter: collectorFilter, max: 1, time: 30_000, errors: ['time']})
                            .then(collected => {
                                const reaction = collected.first();

                                if (reaction.emoji.name === '1️⃣') {
                                    malScraper.getInfoFromName(searchArray[0]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '2️⃣') {
                                    malScraper.getInfoFromName(searchArray[1]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '3️⃣') {
                                    malScraper.getInfoFromName(searchArray[2]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '4️⃣') {
                                    malScraper.getInfoFromName(searchArray[3]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '5️⃣') {
                                    malScraper.getInfoFromName(searchArray[4]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '6️⃣') {
                                    malScraper.getInfoFromName(searchArray[5]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '7️⃣') {
                                    malScraper.getInfoFromName(searchArray[6]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '8️⃣') {
                                    malScraper.getInfoFromName(searchArray[7]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '9️⃣') {
                                    malScraper.getInfoFromName(searchArray[8]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                } else if (reaction.emoji.name === '🔟') {
                                    malScraper.getInfoFromName(searchArray[9]).then(
                                        (data) => response.edit(`**${data.title}**\n${data.picture}\n${data.synopsis}`)
                                    )
                                }
                                response.reactions.removeAll()
                                    .catch(error => console.error('Failed to clear reactions:', error));
                            })
                            .catch(() => {
                                console.log(`Stopped reacting to interaction from ${interaction.user.username} after 60 seconds`);
                                response.edit(`You did not select an anime within 30 seconds!`)
                                response.reactions.removeAll()
                                    .catch(error => console.error('Failed to clear reactions:', error));

                            });
                    })




            }
        )


    }
}