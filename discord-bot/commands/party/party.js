const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Users, CharacterDatabase, GemShop, CurrencyShop} = require('../../dbObjects')
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
    .addComponents(back, next);

function calcLevel(experience) {
    let level = 1
    while (experience > (25 * level)**1.1) {
        level += 1
    }
    return level
}



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
                .setDescription('Check your party members!'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give a member of your party a gift to boost their power!')
                .addStringOption(option =>
                    option
                        .setName('member')
                        .setDescription('Member to give gift to')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('gift')
                        .setDescription('Choose the gift!')
                        .setRequired(true)
                        .addChoices(
                            {name: "Chocolate", value: 'Chocolate'},
                            {name: "Shiny Gift 🎁", value: 'Shiny Gift 🎁'},
                            {name: 'Pretty Phone 📱', value: 'Pretty Phone 📱'},
                            {name: 'Lovely Gift 💝', value: 'Lovely Gift 💝'},
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Invest a party members stat points!')
                .addStringOption(option =>
                    option
                        .setName('member')
                        .setDescription('Choose party member')
                        .setRequired(true))),
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
                    let experienceTillNextLvl = Math.ceil((50 *(characterArray[count].level))**1.1)
                    let level = calcLevel(characterArray[count].experience)
                    let levelDiff = level - characterArray[count].level
                    if (characterArray[count].level < level) {
                        await CharacterDatabase.update({
                            level: level,
                            statpoints:characterArray[count].statpoints + levelDiff }, {
                            where: {id: characterArray[count].id},
                        })
                    }
                    const characterEmbed = new EmbedBuilder()
                        .setColor('#106078')
                        .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                        .setTitle(characterArray[0].name)
                        .addFields(
                            {name:`Level ${characterArray[count].level}`, value: `${characterArray[count].experience}/${experienceTillNextLvl}`, inline: true},
                            {name: 'ATK', value: `${characterArray[count].attack}`, inline: true},
                            {name: 'DEF', value: `${characterArray[count].defense}`, inline: true},
                            {name: 'HP', value: `${characterArray[count].health}`, inline: true},
                            {name: 'SPEED', value: `${characterArray[count].speed}`, inline: true},
                            {name: 'SP', value: `${characterArray[count].statpoints}`, inline: true}
                        )
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
                            let experienceTillNextLvl = Math.ceil((50 *(characterArray[count].level))**1.1)
                            let level = calcLevel(characterArray[count].experience)
                            let levelDiff = level - characterArray[count].level
                            if (characterArray[count].level < level) {
                                await CharacterDatabase.update({
                                    level: level,
                                    statpoints:characterArray[count].statpoints + levelDiff }, {
                                    where: {id: characterArray[count].id},
                                })
                            }
                            const characterEmbed = new EmbedBuilder()
                                .setColor('#106078')
                                .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                                .setTitle(characterArray[count].name)
                                .addFields(
                                    {name:`Level ${characterArray[count].level}`, value: `${characterArray[count].experience}/${experienceTillNextLvl}`, inline: true},
                                    {name: 'ATK', value: `${characterArray[count].attack}`, inline: true},
                                    {name: 'DEF', value: `${characterArray[count].defense}`, inline: true},
                                    {name: 'HP', value: `${characterArray[count].health}`, inline: true},
                                    {name: 'SPEED', value: `${characterArray[count].speed}`, inline: true},
                                    {name: 'SP', value: `${characterArray[count].statpoints}`, inline: true}
                                )
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
                            let experienceTillNextLvl = Math.ceil((50 *(characterArray[count].level))**1.1)
                            let level = calcLevel(characterArray[count].experience)
                            let levelDiff = level - characterArray[count].level
                            if (characterArray[count].level < level) {
                                await CharacterDatabase.update({
                                    level: level,
                                    statpoints: characterArray[count].statpoints + levelDiff }, {
                                    where: {id: characterArray[count].id},
                                })
                            }
                            const characterEmbed = new EmbedBuilder()
                                .setColor('#106078')
                                .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                                .setTitle(characterArray[count].name)
                                .addFields(
                                    {name:`Level ${characterArray[count].level}`, value: `${characterArray[count].experience}/${experienceTillNextLvl}`, inline: true},
                                    {name: 'ATK', value: `${characterArray[count].attack}`, inline: true},
                                    {name: 'DEF', value: `${characterArray[count].defense}`, inline: true},
                                    {name: 'HP', value: `${characterArray[count].health}`, inline: true},
                                    {name: 'SPEED', value: `${characterArray[count].speed}`, inline: true},
                                    {name: 'SP', value: `${characterArray[count].statpoints}`, inline: true}
                                )
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
        } else if (interaction.options.getSubcommand() === 'give') {
            let amountChoc = ''
            let amountGift = ''
            let amountPhone = ''
            let amountLove = ''
            const user = await Users.findOne({ where: { user_id: (interaction.user.id) } });
            const items = await user.getItems();
            const name = interaction.options.get('member').value
            const character = await CharacterDatabase.findOne({ where: { name: { [Op.like]: name } } });
            let enoughGifts = false;
            const request = interaction.options.get('gift').value
            let givenExp = 0
            items.map(async i => {
                if (i.item === null) {
                    if (i.gemItem.name === 'Lovely Gift 💝') {
                        amountLove = i.amount
                    }
                } else {
                    if (i.item.name === "Chocolate") {
                        amountChoc = i.amount
                    } else if (i.item.name === "Shiny Gift 🎁") {
                        amountGift = i.amount
                    } else if (i.item.name === "Pretty Phone 📱") {
                        amountPhone = i.amount
                    }
                }
            })
            if (request === 'Chocolate') {
                enoughGifts = parseInt(amountChoc) > 0;
                givenExp = 10
            } else if (request === 'Shiny Gift 🎁') {
                enoughGifts = parseInt(amountGift) > 0;
                givenExp = 30
            } else if (request === 'Pretty Phone 📱') {
                enoughGifts = parseInt(amountPhone) > 0;
                givenExp = 50
            } else if (request === 'Lovely Gift 💝') {
                enoughGifts = parseInt(amountLove) > 0;
                givenExp = 70
            }


            if (!character) {
                interaction.reply('That character does not exist')
            } else if (!enoughGifts) {
                interaction.reply(`You don't have that type of gift!`)
            } else {
                if (character.owner === interaction.user.id) {
                    if (request === 'Lovely Gift 💝') {
                        const item = await GemShop.findOne({where: {name: {[Op.like]: request}}});
                        user.removeItem(item)
                    } else {
                        const item = await CurrencyShop.findOne({where: {name: {[Op.like]: request}}});
                        user.removeItem(item)
                    }
                    await CharacterDatabase.update({
                        experience: character.experience + givenExp, }, {
                        where: {id: character.id}
                    })
                    interaction.reply(`${character.name} was given ${givenExp} EXP!`)

                } else {
                    interaction.reply('That character is not in your party!')
                }
            }





        } else if (interaction.options.getSubcommand() === 'stats') {
            const name = interaction.options.get('member').value
            const character = await CharacterDatabase.findOne({ where: { name: { [Op.like]: name } } });
            if (!character) {
                interaction.reply('That character does not exist!')
            } else {
                if (character.owner === interaction.user.id) {
                    let statPoints = character.statpoints
                    let characterAtk = character.attack
                    let characterDef = character.defense
                    let characterSpd = character.speed
                    let characterHp = character.health
                    let finish = false
                    let end = false;
                    const statEmbed = new EmbedBuilder()
                        .setColor('#106078')
                        .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                        .setTitle(character.name)
                        .setImage(character.image_id)
                        .addFields(
                            {name: 'ATK⚔️', value: `${characterAtk}`, inline: true},
                            {name: 'DEF🛡️', value: `${characterDef}`, inline: true},
                            {name: 'HP❤️', value: `${characterHp}`, inline: true},
                            {name: 'SPEED🏃‍♂️', value: `${characterSpd}`, inline: true},
                        )
                        .addFields(
                            {name: 'SP', value: `${statPoints}`}
                        );
                    const collectorFilter = (reaction, user) => {
                        return ['⚔️', '🛡️', '❤️', '🏃‍♂️', '✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id
                    }
                    interaction.reply('Opening stat page!')
                    interaction.channel.send({embeds: [statEmbed], fetchReply: true}).then((response) => {
                        response.react('⚔️')
                            .then(() => response.react('🛡️'))
                            .then(() => response.react('❤️'))
                            .then(() => response.react('🏃‍♂️'))
                            .then(() => response.react('✅'))
                            .then(() => response.react('❌'))
                            .then(() => {
                                const collector = response.createReactionCollector({filter: collectorFilter, time: 90_000})
                                        collector.on('collect', r => {
                                            if (statPoints > 0) {
                                                if (r.emoji.name === '🛡️') {
                                                    characterDef += 1
                                                    statPoints -= 1
                                                } else if (r.emoji.name === '⚔️') {
                                                    characterAtk += 1
                                                    statPoints -= 1
                                                } else if (r.emoji.name === '❤️') {
                                                    characterHp += 3
                                                    statPoints -= 1
                                                } else if (r.emoji.name === '🏃‍♂️') {
                                                    characterSpd += 1
                                                    statPoints -= 1
                                                }
                                            }
                                                if (r.emoji.name === '✅') {
                                                    finish = true
                                                    response.reactions.removeAll()
                                                        .catch(error => console.log('Failed to clear reactions', error))
                                                    response.reply(`${character.name} has been given:\nATK:${characterAtk}\nDEF:${characterDef}\nHP:${characterHp}\nSPEED:${characterSpd}\nStat Points remaining: ${statPoints}`)
                                                    CharacterDatabase.update({
                                                        health: characterHp,
                                                        attack: characterAtk,
                                                        defense: characterDef,
                                                        speed: characterSpd,
                                                        statpoints: statPoints,}, {
                                                        where: {id: character.id}
                                                    })
                                                    end = true

                                                } else if (r.emoji.name === '❌') {
                                                    collector.stop()
                                                    end = true
                                                }
                                                const statEmbed = new EmbedBuilder()
                                                    .setColor('#106078')
                                                    .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                                                    .setTitle(character.name)
                                                    .setImage(character.image_id)
                                                    .addFields(
                                                        {name: 'ATK⚔️', value: `${characterAtk}`, inline: true},
                                                        {name: 'DEF🛡️', value: `${characterDef}`, inline: true},
                                                        {name: 'HP❤️', value: `${characterHp}`, inline: true},
                                                        {name: 'SPEED🏃‍♂️', value: `${characterSpd}`, inline: true},
                                                    )
                                                    .addFields(
                                                        {name: 'SP', value: `${statPoints}`}
                                                    );
                                                if (!end) {
                                                    response.edit({
                                                        embeds: [statEmbed],
                                                        fetchReply: true,
                                                    })
                                                }


                                        })
                                        collector.on('end', async () => {
                                            if (!finish) {
                                                response.reactions.removeAll()
                                                    .catch(error => console.log('Failed to clear reactions', error))
                                                response.edit({
                                                    content: 'Exited!',
                                                    embeds: [],
                                                })
                                            }
                                        })



                            })
                    })


                } else {
                    interaction.reply('That character is not in your party!')
                }
            }
        }



    }
}