const {  ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { balance, exp } = require('../../importantfunctions/mutators.js')

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

function dealCard(cards) {
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards.splice(randomIndex, 1)[0];
}

function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card === 1) {
            aces++;
            value += 11;
        } else if (card > 10) {
            value += 10;
        } else {
            value += card;
        }
    }
    
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    
    return value;
}

function handToString(hand) {
    return hand.map(card => cardGiven(card)).join('');
}

function shouldDealerHit(dealerValue) {
    return dealerValue < 17;
}

function isBlackjack(hand) {
    return hand.length === 2 && calculateHandValue(hand) === 21;
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
        let cards = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12];
        const collectorFilter = i => i.user.id === interaction.user.id;
        let userBalance = balance.getBalance(interaction.user.id);
        let betAmount = interaction.options.get('money-to-bet').value;
        exp.addExp(interaction.user.id, 5);

        if (userBalance < betAmount) {
            return interaction.reply({
                content: "You are trying to bet more than you own, try again!",
                components: [],
                ephemeral: true,
            });
        }

        let playerHand = [dealCard(cards), dealCard(cards)];
        let dealerHand = [dealCard(cards), dealCard(cards)];
        let gameEnded = false;
        let canDoubleDown = true;

        let playerValue = calculateHandValue(playerHand);
        let dealerValue = calculateHandValue(dealerHand);
        let dealerShowValue = calculateHandValue([dealerHand[0]]);

        if (isBlackjack(playerHand) && isBlackjack(dealerHand)) {
            return interaction.reply({
                content: `Both got blackjack! ${handToString(playerHand)} vs ${handToString(dealerHand)}\nPush - no moolah lost or gained!`,
                components: [],
            });
        } else if (isBlackjack(playerHand)) {
            let winnings = Math.floor(betAmount * 1.5);
            await balance.addBalance(interaction.user.id, winnings);
            return interaction.reply({
                content: `Blackjack! ${handToString(playerHand)} beats dealer's ${handToString(dealerHand)}\nYou won ${winnings} moolah!`,
                components: [],
            });
        } else if (isBlackjack(dealerHand)) {
            await balance.addBalance(interaction.user.id, -betAmount);
            return interaction.reply({
                content: `Dealer blackjack! ${handToString(dealerHand)} beats your ${handToString(playerHand)}\nYou lost ${betAmount} moolah!`,
                components: [],
            });
        }

        const response = await interaction.reply({
            content: `You have ${handToString(playerHand)} (${playerValue})\nDealer shows ${cardGiven(dealerHand[0])} (${dealerShowValue})\nWhat do you want to do?`,
            components: [row2],
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: collectorFilter,
        });

        async function endGame() {
            gameEnded = true;
            collector.stop();
            
            while (shouldDealerHit(dealerValue)) {
                dealerHand.push(dealCard(cards));
                dealerValue = calculateHandValue(dealerHand);
                await wait(1000);
                response.edit({
                    content: `${interaction.user.username}: ${handToString(playerHand)} (${playerValue})\nDealer: ${handToString(dealerHand)} (${dealerValue})`,
                    components: [],
                });
            }

            await wait(1500);
            
            let resultMessage;
            if (dealerValue > 21) {
                await balance.addBalance(interaction.user.id, betAmount);
                resultMessage = `Dealer busts with ${dealerValue}! You won ${betAmount} moolah!`;
            } else if (playerValue > dealerValue) {
                await balance.addBalance(interaction.user.id, betAmount);
                resultMessage = `You win ${playerValue} vs ${dealerValue}! You won ${betAmount} moolah!`;
            } else if (dealerValue > playerValue) {
                await balance.addBalance(interaction.user.id, -betAmount);
                resultMessage = `Dealer wins ${dealerValue} vs ${playerValue}! You lost ${betAmount} moolah!`;
            } else {
                resultMessage = `Push! Both have ${playerValue} - no moolah lost or gained!`;
            }

            response.edit({
                content: `${interaction.user.username}: ${handToString(playerHand)} (${playerValue})\nDealer: ${handToString(dealerHand)} (${dealerValue})\n\n${resultMessage}`,
                components: [],
            });
        }

        collector.on('collect', async (buttonInteraction) => {
            if (gameEnded) return;

            if (buttonInteraction.customId === 'double') {
                if (!canDoubleDown) {
                    return buttonInteraction.update({
                        content: `You can only double down on your first two cards!\nYou have ${handToString(playerHand)} (${playerValue})\nDealer shows ${cardGiven(dealerHand[0])} (${dealerShowValue})`,
                        components: [row]
                    });
                }
                if (userBalance < betAmount * 2) {
                    return buttonInteraction.update({
                        content: `You can't double down, you don't have enough moolah!\nYou have ${handToString(playerHand)} (${playerValue})\nDealer shows ${cardGiven(dealerHand[0])} (${dealerShowValue})`,
                        components: [row]
                    });
                }
                
                betAmount *= 2;
                playerHand.push(dealCard(cards));
                playerValue = calculateHandValue(playerHand);
                canDoubleDown = false;

                if (playerValue > 21) {
                    await balance.addBalance(interaction.user.id, -betAmount);
                    return buttonInteraction.update({
                        content: `Double down bust! ${handToString(playerHand)} (${playerValue})\nYou lost ${betAmount} moolah!`,
                        components: [],
                    });
                }

                buttonInteraction.update({
                    content: `Doubled down! You have ${handToString(playerHand)} (${playerValue})\nDealer will now play...`,
                    components: [],
                });
                await wait(1500);
                await endGame();
            } 
            else if (buttonInteraction.customId === 'hit') {
                playerHand.push(dealCard(cards));
                playerValue = calculateHandValue(playerHand);
                canDoubleDown = false;

                if (playerValue > 21) {
                    await balance.addBalance(interaction.user.id, -betAmount);
                    return buttonInteraction.update({
                        content: `Bust! ${handToString(playerHand)} (${playerValue})\nYou lost ${betAmount} moolah!`,
                        components: [],
                    });
                } else if (playerValue === 21) {
                    buttonInteraction.update({
                        content: `21! ${handToString(playerHand)} (${playerValue})\nDealer will now play...`,
                        components: [],
                    });
                    await wait(1500);
                    await endGame();
                } else {
                    buttonInteraction.update({
                        content: `You have ${handToString(playerHand)} (${playerValue})\nDealer shows ${cardGiven(dealerHand[0])} (${dealerShowValue})`,
                        components: [row],
                    });
                }
            } 
            else if (buttonInteraction.customId === 'stand') {
                buttonInteraction.update({
                    content: `You stand with ${handToString(playerHand)} (${playerValue})\nDealer will now play...`,
                    components: [],
                });
                await wait(1500);
                await endGame();
            }
        });
    }
}