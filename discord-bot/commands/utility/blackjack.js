const {  ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ComponentType, Collection } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
async function addExp(id, amount) {
    const user = userInfo.get(id);
    if (user) {
        user.experience += Number(amount);
        return user.save();
    }
    const newUser = await Users.create({ user_id: id, experience: amount });
    userInfo.set(id, newUser);
    return newUser;
}

function getBalance(id) {
    const user = userInfo.get(id);
    return user ? user.balance : 0;
}
async function addBalance(id, amount) {
    const user = userInfo.get(id);

    if (user) {
        user.balance += Number(amount);
        return user.save();
    }

    const newUser = await Users.create({ user_id: id, balance: amount });
    userInfo.set(id, newUser);

    return newUser;
}



const hit = new ButtonBuilder()
    .setCustomId('hit')
    .setLabel('Hit')
    .setStyle(ButtonStyle.Primary);

const stand = new ButtonBuilder()
    .setCustomId('stand')
    .setLabel('Stand')
    .setStyle(ButtonStyle.Primary);

const doubleDown = new ButtonBuilder()
    .setCustomId('double')
    .setLabel('Double Down')
    .setStyle(ButtonStyle.Danger)

const row = new ActionRowBuilder()
    .addComponents(hit, stand);

const row2 = new ActionRowBuilder()
    .addComponents(hit, stand, doubleDown);

function card(arr) {
    let randomIndex = Math.floor(Math.random() * arr.length)

    let value = arr[randomIndex]
    arr.splice(randomIndex, 1)
    return value
}

function cardGiven(num) {
    switch (num) {
        case 1:
            return '<:ace:1239788987694972928>'
        case 2:
            return '<:2diamond:1239788976576004137>'
        case 3:
            return '<:3spade:1239788977532174376>'
        case 4:
            return '<:4spade:1239788978895327282>'
        case 5:
            return '<:5heart:1239788979952291881>'
        case 6:
            return '<:6clover:1239788980795342930>'
        case 7:
            return '<:7heart:1239788981860962445>'
        case 8:
            return '<:8heart:1239788982821457930>'
        case 9:
            return '<:9spade:1239788983962042368>'
        case 10:
            return '<:jack:1239789138052645015>'
        case 11:
            return '<:king:1239788991214125066>'
        case 12:
            return '<:queen:1239789139231244289>'
    }
}








module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('gamble all your moolah')
        .addIntegerOption(option =>
            option.setName('money-to-bet')
                .setDescription('How much moolah you want to bet')
                .setRequired(true)
                .setMinValue(1)),
    async execute(interaction) {
        let cards = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12]
        console.log(`${interaction.user.username} ran command ${interaction.commandName}.`)
        const collectorFilter = i => i.user.id === interaction.user.id;
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        let userBalance = getBalance(interaction.user.id)
        let betAmount = interaction.options.get('money-to-bet').value;
        addExp(interaction.user.id, 5)
        let currentValue = 0
        let dealerValue = 0
        let userCardString = ''
        let dealerCardString = ''
        let cardChosen = 0



        if (userBalance < interaction.options.get('money-to-bet').value) {
            interaction.reply({
                content: "You are trying to bet more than you own, try again!",
                components: [],
                ephemeral: true,
            });
        } else {
            cardChosen = card(cards)
            if (cardChosen > 10) {
                currentValue += 10
            } else {
                if ((currentValue <= 10) && (cardChosen === 1)) {
                    currentValue += 11
                } else {
                    currentValue += cardChosen
                }
            }
            userCardString = userCardString + cardGiven(cardChosen)
            cardChosen = card(cards)
            if (cardChosen > 10) {
                currentValue += 10
            } else {
                if ((currentValue <= 10) && (cardChosen === 1)) {
                    currentValue += 11
                } else {
                    currentValue += cardChosen
                }
            }
            userCardString = userCardString + cardGiven(cardChosen)

            //dealer
            cardChosen = card(cards)
            if (cardChosen > 10) {
                dealerValue += 10
            } else {
                if ((dealerValue <= 10) && (cardChosen === 1)) {
                    dealerValue += 11
                } else {
                    dealerValue += cardChosen
                }
            }
            dealerCardString = dealerCardString + cardGiven(cardChosen)


                const response = await interaction.reply({
                    content: `The dealer deals ${userCardString} (${currentValue}) do you want to hit or stand?\nThe dealer has ${dealerCardString} (${dealerValue})`,
                    components: [row2],
                });

                const collector = response.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter: collectorFilter,
                });

                collector.on('collect', async (interaction) => {

                    if (interaction.customId === 'double') {
                        if (userBalance > (betAmount * 2)) {
                            betAmount *= 2;
                            interaction.update({
                                content: `You chose to double down! You've got ${userCardString} (${currentValue}), do you hit or stand?\nThe dealer has ${dealerCardString} (${dealerValue})`,
                                components: [row]
                            })
                        } else {
                            interaction.update({
                                content: `You can't double down, you don't have enough moolah!\nYou've got ${userCardString} (${currentValue}), do you hit or stand?\nThe dealer has ${dealerCardString} (${dealerValue})`,
                                components: [row]
                            })
                        }

                    }
                    if (interaction.customId === 'hit') {
                        cardChosen = card(cards)
                        if (cardChosen > 10) {
                            currentValue += 10
                        } else {
                            if ((currentValue <= 10) && (cardChosen === 1)) {
                                currentValue += 11
                            } else {
                                currentValue += cardChosen
                            }
                        }
                        userCardString = userCardString + cardGiven(cardChosen)

                        if (currentValue > 21) {
                            interaction.update({
                                content: `You went past 21 with ${userCardString} (${currentValue}). You lost ${betAmount} moolah!`,
                                components: [],
                            });
                            await addBalance(interaction.user.id, -betAmount)



                        } else if (currentValue < 21) {

                            interaction.update({
                                content: `You've got ${userCardString} (${currentValue})\ntanyaBot: ${dealerCardString} (${dealerValue})`,
                                components: [row],
                            });


                        } else if (currentValue === 21) {
                            interaction.update({
                                content: `You landed on 21 with ${userCardString}! Now the dealer will play.`,
                                components: [],
                            });
                            await wait(1500)
                            response.edit({
                                content: `${interaction.user.username}: ${userCardString} (${currentValue})\ntanyaBot: ${dealerCardString} (${dealerValue})`,
                            })
                            await wait(1500)
                            while (dealerValue < currentValue) {
                                cardChosen = card(cards)
                                if (cardChosen > 10) {
                                    dealerValue += 10
                                } else {
                                    if ((dealerValue <= 10) && (cardChosen === 1)) {
                                        dealerValue += 11
                                    } else {
                                        dealerValue += cardChosen
                                    }
                                }
                                dealerCardString = dealerCardString + cardGiven(cardChosen)
                                await wait(1000)
                                response.edit({
                                    content: `${interaction.user.username}: ${userCardString} (${currentValue})\ntanyaBot: ${dealerCardString} (${dealerValue})`,
                                })
                            }
                            await wait(2500)
                            if (dealerValue === currentValue) {
                                response.edit({
                                    content: `Bust!\n${interaction.user.username}: ${userCardString} (${currentValue})\ntanyaBot: ${dealerCardString} (${dealerValue})\nNo moolah lost or gained!`
                                })
                            } else if (dealerValue <= 21) {
                                response.edit({
                                    content: `Dealer wins with ${dealerCardString} (${dealerValue})! You lost ${betAmount} moolah with ${userCardString} (${currentValue})`
                                })
                                await addBalance(interaction.user.id, -betAmount)
                            } else {
                                response.edit({
                                    content: `Dealer loses with ${dealerCardString} (${dealerValue})! You won ${betAmount} moolah with ${userCardString} (${currentValue})`
                                })
                                await addBalance(interaction.user.id, betAmount)
                            }
                        }


                    } else if (interaction.customId === 'stand') {
                        interaction.update({
                            content: `You chose to stand on ${userCardString} (${currentValue}). The dealer will now play.`,
                            components: [],
                        });
                        await wait(1500)
                        response.edit({
                            content: `${interaction.user.username}: ${userCardString} (${currentValue})\ntanyaBot: ${dealerCardString} (${dealerValue})`,
                        })
                        await wait(1500)
                        while (dealerValue < currentValue) {
                            cardChosen = card(cards)
                            if (cardChosen > 10) {
                                dealerValue += 10
                            } else {
                                if ((dealerValue <= 10) && (cardChosen === 1)) {
                                    dealerValue += 11
                                } else {
                                    dealerValue += cardChosen
                                }
                            }
                            dealerCardString = dealerCardString + cardGiven(cardChosen)
                            await wait(1000)
                            response.edit({
                                content: `${interaction.user.username}: ${userCardString} (${currentValue})\ntanyaBot: ${dealerCardString} (${dealerValue})`,
                            })
                        }
                        await wait(2500)
                        if (dealerValue === currentValue) {
                            response.edit({
                                content: `Bust!\n${interaction.user.username}: ${userCardString} (${currentValue})\ntanyaBot: ${dealerCardString} (${dealerValue})\nNo moolah lost or gained!`
                            })
                        } else if (dealerValue <= 21) {
                            response.edit({
                                content: `Dealer wins with ${dealerCardString} (${dealerValue})! You lost ${betAmount} moolah with ${userCardString} (${currentValue})`
                            })
                            await addBalance(interaction.user.id, -betAmount)
                        } else {
                            response.edit({
                                content: `Dealer loses with ${dealerCardString} (${dealerValue})! You won ${betAmount} moolah with ${userCardString} (${currentValue})`
                            })
                            await addBalance(interaction.user.id, betAmount)
                        }



                    }

                })
            }


        }
}