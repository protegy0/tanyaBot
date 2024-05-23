const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CharacterDatabase } = require('../../dbObjects')
const { Op} = require('sequelize')
const wait = require('node:timers/promises').setTimeout;
const { gems } = require('../../importantfunctions/mutators.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duel')
        .setDescription('Fight another party!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('solo')
                .setDescription('Choose one party member to fight another!')
                .addUserOption(option =>
                    option
                        .setName('opponent')
                        .setDescription('Choose opponent to fight')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('member')
                        .setDescription('Party member you chose to fight')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('trio')
                .setDescription('Choose three party members to fight another party!')
                .addUserOption(option =>
                    option
                        .setName('opponent')
                        .setDescription('Choose opponent to fight')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('firstmember')
                        .setDescription('First member')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('secondmember')
                        .setDescription('Second member')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('thirdmember')
                        .setDescription('Third member')
                        .setRequired(true))),
    async execute(interaction) {
        let opponentChar;
        let userChar;
        let response;
        let choice = false;
        if (interaction.options.get('opponent').value === interaction.user.id) {
            interaction.reply(`You can't duel yourself!`)
        } else {
            if (interaction.options.getSubcommand() === 'solo') {
                const charName = interaction.options.get('member').value
                const character = await CharacterDatabase.findOne({ where: { name: { [Op.like]: charName } } });
                if (!character) {
                    interaction.reply('That character does not exist')
                } else {
                    if (character.owner === interaction.user.id) {
                        userChar = character
                        const collectorFilter = m => (m.author.id === interaction.options.get('opponent').value) && ((m.content.toLowerCase() === 'y') || (m.content.toLowerCase() === 'yes') || (m.content.toLowerCase() === 'n') || (m.content.toLowerCase() === 'no'))
                        const collectorFilter2 = m => (m.author.id === interaction.options.get('opponent').value)
                        response  = await interaction.reply({
                            content: `<@${interaction.options.get('opponent').value}> has been challenged to a solo duel by <@${interaction.user.id}>! Do you accept? (Y/N)`,
                            fetchReply: true,
                        });
                        const collector = interaction.channel.createMessageCollector({
                            filter: collectorFilter,
                            time: 30_000,
                            max: 1,
                        })
                        collector.on('collect', m => {
                            if ((m.content.toLowerCase() === 'y') || (m.content.toLowerCase() === 'yes')) {
                                m.reply('Type the name of the member you want to represent you!')
                                const collector2 = interaction.channel.createMessageCollector({
                                    filter: collectorFilter2,
                                    time: 30_000,
                                })
                                collector2.on('collect', async m => {
                                    let chosenOpponent = await CharacterDatabase.findOne({where: {name: { [Op.like]: m.content } } } );
                                    if (!chosenOpponent) {
                                        m.reply('That character does not exist!')
                                    } else if (chosenOpponent.owner === m.author.id) {
                                        choice = true
                                        opponentChar = chosenOpponent
                                        let opponentHealth = opponentChar.health
                                        let opponentSpd = opponentChar.speed
                                        let opponentAtk = opponentChar.attack
                                        let opponentDef = opponentChar.defense

                                        let userHealth = userChar.health
                                        let userSpd = userChar.speed
                                        let userAtk = userChar.attack
                                        let userDef = userChar.defense

                                        let opponentDMG = 0
                                        let userDMG = 0

                                        const fightEmbed = new EmbedBuilder()
                                            .setColor('#106078')
                                            .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                                            .setTitle(`${userChar.name} vs ${opponentChar.name}!`)
                                            .addFields(
                                                {name: `${userChar.name}`, value: `HP: ${userHealth}\nAtk:${userAtk}\nDef:${userDef}\nSpd:${userSpd}`},
                                                {name: `${opponentChar.name}`, value: `HP: ${opponentHealth}\nAtk:${opponentAtk}\nDef:${opponentDef}\nSpd:${opponentSpd}`}
                                            )
                                        const fight = await response.reply({embeds: [fightEmbed]})
                                        while (opponentHealth > 0 && userHealth > 0) {
                                            opponentDMG = Math.floor(Math.random() * opponentAtk)
                                            userDMG = Math.floor(Math.random() * userAtk)
                                            if (userDef > opponentAtk) {
                                                opponentDMG = Math.ceil(opponentDMG / 2)
                                            } else if (opponentDef > userAtk) {
                                                userDMG = Math.ceil(opponentDMG / 2)
                                            }

                                            opponentHealth -= userDMG
                                            userHealth -= opponentDMG
                                            const userCharEmbed = new EmbedBuilder()
                                                .setColor('#106078')
                                                .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                                                .setImage(userChar.image_id)
                                                .addFields(
                                                    {name: `**HP**`, value: `**${userHealth}**`, inline: true},
                                                    {name: `**ATK**`, value: `**${userAtk}**`, inline: true},
                                                    {name: `**DEF**`, value: `**${userDef}**`, inline: true},
                                                    {name: `**SPD**`, value: `**${userSpd}**`, inline: true},

                                                )
                                            const opponentCharEmbed = new EmbedBuilder()
                                                .setColor('#106078')
                                                .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                                                .setImage(opponentChar.image_id)
                                                .addFields(
                                                    {name: `**HP**`, value: `**${opponentHealth}**`, inline: true},
                                                    {name: `**ATK**`, value: `**${opponentAtk}**`, inline: true},
                                                    {name: `**DEF**`, value: `**${opponentDef}**`, inline: true},
                                                    {name: `**SPD**`, value: `**${opponentSpd}**`, inline: true},
                                                )
                                            await wait(1500)
                                            fight.reply(`${userChar.name} took ${opponentDMG} DMG from ${opponentChar.name} and was reduced to ${userHealth}!`)
                                            await wait(1500)
                                            fight.reply(`${opponentChar.name} took ${userDMG} DMG from ${userChar.name} and was reduced to ${opponentHealth}!`)
                                            await wait(1500)
                                            fight.reply({embeds:[userCharEmbed, opponentCharEmbed]})
                                        }
                                        if (userHealth <= 0 && opponentHealth <= 0) {
                                            if (userSpd > opponentSpd) {
                                                fight.reply(`Both fighters used strong attacks but ${userChar.name} was faster! They have won the fight!\nTheir party leader has been awarded 3 gems!\n${userChar.name} has gained 30 EXP.`)
                                                await CharacterDatabase.update({
                                                    experience: character.experience + 30, }, {
                                                    where: {id: userChar.id}
                                                })
                                            } else if (opponentSpd > userSpd) {
                                                fight.reply(`Both fighters used strong attacks but ${opponentChar.name} was faster! They have won the fight!\nTheir party leader has been awarded 3 gems!\n${userChar.name} has gained 30 EXP.`)
                                                await CharacterDatabase.update({
                                                    experience: character.experience + 30, }, {
                                                    where: {id: opponentChar.id}
                                                })
                                            } else {
                                                fight.reply(`Tie! Both characters were reduced to zero! 5 EXP has been awarded to both.`)
                                                await CharacterDatabase.update({
                                                    experience: character.experience + 5, }, {
                                                    where: {id: userChar.id}
                                                })
                                                await CharacterDatabase.update({
                                                    experience: character.experience + 5, }, {
                                                    where: {id: opponentChar.id}
                                                })
                                            }

                                        } else if (userHealth > opponentHealth) {
                                            fight.reply(`${userChar.name} has won the fight! Their party leader has been awarded 3 gems!\n${userChar.name} has gained 30 EXP.`)
                                            await CharacterDatabase.update({
                                                experience: character.experience + 30, }, {
                                                where: {id: userChar.id}
                                            })
                                            gems.addGems(interaction.user.id, 3)
                                        } else if (opponentHealth > userHealth) {
                                            fight.reply(`${opponentChar.name} has won the fight! Their party leader has been awarded 3 gems!\n${opponentChar.name} has gained 30 EXP.`)
                                            await CharacterDatabase.update({
                                                experience: character.experience + 30, }, {
                                                where: {id: opponentChar.id}
                                            })
                                            gems.addGems(interaction.options.get('opponent').value, 3)
                                        }
                                    } else {
                                        m.reply('You do not own this character!')
                                    }
                                })
                                collector2.on('end', () => {
                                    if (!choice) {
                                        response.edit('You did not choose in time!')
                                    }
                                })

                            } else if ((m.content.toLowerCase() === 'n') || (m.content.toLowerCase() === 'no')) {
                                m.reply(`<@${interaction.options.get('opponent').value}> has declined the duel!`)
                            }
                        })
                    } else {
                        interaction.reply('You dont own that character')
                    }


                }
            }
        }

    }


}