const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Users, CharacterDatabase } = require('../../dbObjects')
const { Op } = require('sequelize')

const next = new ButtonBuilder()
    .setCustomId('next')
    .setLabel('Next')
    .setStyle(ButtonStyle.Primary);
const back = new ButtonBuilder()
    .setCustomId('back')
    .setLabel('Back')
    .setStyle(ButtonStyle.Primary);
const row = new ActionRowBuilder()
    .addComponents(back, next)



module.exports = {
    data: new SlashCommandBuilder()
        .setName('party')
        .setDescription('Check your party!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Kick someone out of the party!')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the character')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('members')
                .setDescription('Check your party members!')),
    async execute(interaction) {
        const target = interaction.user.id
        const user = await Users.findOne({ where: { user_id: (target) } });
        if (interaction.options.getSubcommand() === 'remove') {
            const name = interaction.options.get('name').value
            const character = await CharacterDatabase.findOne({ where: { name: { [Op.like]: name } } });
            if (!character) {
                interaction.reply('That character does not exist')
            } else {
                if (character.owner === target) {
                    user.removeCharacter(character)
                    const updatedChar = await CharacterDatabase.update({
                        name: character.name,
                        image_id: character.image_id,
                        owner: '0', }, {
                        where: {id: character.id},
                    })
                    if (updatedChar > 0) {
                        interaction.reply(`${character.name} has been released from the party! Goodbye...`)
                    } else {
                        interaction.reply(`Something went wrong, ask protegy lol`)
                    }
                } else {
                    interaction.reply(`That character is not in your party!`)
                }
            }


        } else if (interaction.options.getSubcommand() === 'members') {
            const collectorFilter = i => i.user.id === interaction.user.id
            const characters = await user.getCharacters();
            let charIdArray = []
            let characterArray = []
            let count = 0
            if (!characters.length) {
                interaction.reply(`${interaction.user.username} has absolutely nothing!`);
            } else {
                characters.map(i => {
                    if (i.amount > 0) {
                        charIdArray.push(i.character_id)
                    }
                })
                if (charIdArray.length === 0) {
                    interaction.reply(`${interaction.user.username} has no one in their party!`);
                } else {
                    for (let char of charIdArray) {
                        const character = await CharacterDatabase.findOne({where: {id: (char)}})
                        characterArray.push(character)
                    }
                    const characterEmbed = new EmbedBuilder()
                        .setColor('#106078')
                        .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                        .setTitle(characterArray[0].name)
                        .setImage(characterArray[0].image_id)
                        .setFooter({text: `Partied with: ${interaction.user.username} • 1/${characterArray.length}`});
                    const response = await interaction.reply({embeds: [characterEmbed], components: [row]})
                    const collector = response.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        filter: collectorFilter,
                        time: 60_000,
                    });
                    collector.on('collect', async(interaction) => {
                        if (interaction.customId === 'back') {
                            if (count > 0) {
                                count -= 1
                            } else {
                                count = characterArray.length - 1
                            }
                            const characterEmbed = new EmbedBuilder()
                                .setColor('#106078')
                                .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                                .setTitle(characterArray[count].name)
                                .setImage(characterArray[count].image_id)
                                .setFooter({text: `Partied with: ${interaction.user.username} • ${count + 1}/${characterArray.length}`});
                            interaction.update({
                                embeds: [characterEmbed],
                                components: [row],
                            })
                        } else if (interaction.customId === 'next') {
                            if (count < (characterArray.length - 1)) {
                                count += 1
                            } else {
                                count = 0
                            }
                            const characterEmbed = new EmbedBuilder()
                                .setColor('#106078')
                                .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                                .setTitle(characterArray[count].name)
                                .setImage(characterArray[count].image_id)
                                .setFooter({text: `Partied with: ${interaction.user.username} • ${count + 1}/${characterArray.length}`});
                            interaction.update({
                                embeds: [characterEmbed],
                                components: [row],
                            })
                        }
                    })
                    collector.on('end', () => {
                        response.edit({
                            embeds: [characterEmbed],
                            components: [],
                        })
                    })

                }

            }
        }



    }
}