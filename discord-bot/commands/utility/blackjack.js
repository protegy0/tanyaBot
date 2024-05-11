const {  ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ComponentType, Collection } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users } = require('../../dbObjects.js');
const currency = new Collection()

function getBalance(id) {
    const user = currency.get(id);
    return user ? user.balance : 0;
}
async function addBalance(id, amount) {
    const user = currency.get(id);

    if (user) {
        user.balance += Number(amount);
        return user.save();
    }

    const newUser = await Users.create({ user_id: id, balance: amount });
    currency.set(id, newUser);

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

const row = new ActionRowBuilder()
    .addComponents(hit, stand);

function card() {
    const percentTen = Math.random();
    let randomNumber = 0;
    if (percentTen < 0.308) {
        randomNumber = 10;
    } else {
        randomNumber = Math.floor(Math.random() * 11) + 1;
    }
    return randomNumber;
}
function updateValue(cardValue, number) {
    if ((cardValue >= 10) && (number === 11)) {
        cardValue++;
    } else {
        cardValue = cardValue + number
    }
    return cardValue;
}






module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('gamble all your moolah')
        .addIntegerOption(option =>
            option.setName('money-to-bet')
                .setDescription('How much moolah you want to bet')
                .setRequired(true)),
    async execute(interaction) {
        console.log(`${interaction.user.username} ran command ${interaction.commandName}.`)
        const collectorFilter = i => i.user.id === interaction.user.id;
        let currentValue = Math.floor(Math.random() * (21 - 4 + 1)) + 4;
        let dealerValue = Math.floor(Math.random() * (21 - 4 + 1)) + 4;
        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => currency.set(b.user_id, b));
        let userBalance = getBalance(interaction.user.id)
        //console.log(`Beginning balance: ${userBalance}`)
        let betAmount = interaction.options.get('money-to-bet').value;
        if (userBalance < interaction.options.get('money-to-bet').value) {
            interaction.reply({
                content: "You are trying to bet more than you own, try again!",
                components: [],
                ephemeral: true,
            });
            hit.setDisabled(true);
            stand.setDisabled(true);
        } else {
            hit.setDisabled(false)
            stand.setDisabled(false)
            const response = await interaction.reply({
                content: `The dealer deals ${currentValue} do you want to hit or stand?`,
                components: [row],
            });

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: collectorFilter,
            });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'hit') {
                    let randomNumber = card();

                    currentValue = updateValue(currentValue, randomNumber);
                    if (currentValue > 21) {
                        interaction.update({
                            content: `You landed on ${currentValue}. You lost ${betAmount} moolah!`,
                            components: [],
                        });
                        //console.log(`Attempting to remove ${betAmount}`)
                        await addBalance(interaction.user.id, -betAmount)
                        //console.log(`Ending balance: ${userBalance}`)


                    } else if (currentValue < 21) {

                        interaction.update({
                            content: `You landed on ${currentValue}.`,
                            components: [row],
                        });


                    } else if (currentValue === 21) {
                        interaction.update({
                            content: `You landed on ${currentValue}! Now the dealer will play.`,
                            components: [],
                        });
                        await wait(1500)
                        response.edit({
                            content: `${interaction.user.username}: ${currentValue}\ntanyaBot: ${dealerValue}`,
                        })
                        await wait (1500)
                        while (dealerValue < currentValue) {
                            let randomNumber = card();
                            dealerValue = updateValue(dealerValue, randomNumber);
                            await wait(1500)
                            response.edit({
                                content: `${interaction.user.username}: ${currentValue}\ntanyaBot: ${dealerValue}`,
                            })
                        }
                        await wait(2500)
                        if (dealerValue === currentValue) {
                            response.edit({
                                content: `Bust! No moolah is lost or gained`
                            })
                        } else if (dealerValue <= 21) {
                            response.edit({
                                content: `Dealer wins! You lose ${betAmount} moolah!`
                            })
                            console.log(`Attempting to remove ${betAmount}`)
                            await addBalance(interaction.user.id, -betAmount)
                        } else {
                            response.edit({
                                content: `Dealer loses! You win ${betAmount} moolah!`
                            })
                            console.log(`Attempting to add ${betAmount}`)
                            await addBalance(interaction.user.id, betAmount)
                        }
                        //console.log(`Ending balance: ${userBalance}`)
                    }


                } else if (interaction.customId === 'stand') {
                    interaction.update({
                        content: `You chose to stand on ${currentValue}. The dealer will now play.`,
                        components: [],
                    });
                    await wait(1500)
                    response.edit({
                        content: `${interaction.user.username}: ${currentValue}\ntanyaBot: ${dealerValue}`,
                    })
                    await wait (1500)
                    while (dealerValue < currentValue) {
                        let randomNumber = card();
                        dealerValue = updateValue(dealerValue, randomNumber);
                        await wait(1500)
                        response.edit({
                            content: `${interaction.user.username}: ${currentValue}\ntanyaBot: ${dealerValue}`,
                        })
                    }
                    await wait(2500)
                    if (dealerValue === currentValue) {
                        response.edit({
                            content: `Bust! No moolah is lost or gained`
                        })
                    } else if (dealerValue <= 21) {
                        response.edit({
                            content: `Dealer wins! You lose ${betAmount} moolah!`
                        })
                        //console.log(`Attempting to remove ${betAmount}`)
                        await addBalance(interaction.user.id, -betAmount)
                    } else {
                        response.edit({
                            content: `Dealer loses! You win ${betAmount} moolah!`
                        })
                        //console.log(`Attempting to add ${betAmount}`)
                        await addBalance(interaction.user.id, betAmount)
                    }
                    //console.log(`Ending balance: ${userBalance}`)


                }

            })
        }




    }
}