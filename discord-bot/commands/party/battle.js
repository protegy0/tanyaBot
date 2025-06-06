const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { CharacterDatabase } = require('../../dbObjects');
const { Op } = require('sequelize');
const wait = require('node:timers/promises').setTimeout;
const { balance, gems, exp, battleStats, battleTime, level } = require('../../importantfunctions/mutators.js');
const commandStateManager = require('../../commandStateManager.js');

function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    if (seconds < 60) return seconds + " seconds";
    else if (minutes < 60) return minutes + " minutes";
    else return hours + " hours";
}

// NPC/Boss database
const NPCS = {
    'slime': {
        name: 'Green Slime',
        emoji: '🟢',
        level: 1,
        health: 25,
        attack: 8,
        defense: 3,
        speed: 5,
        rewards: { moolah: [10, 25], exp: [15, 25], gems: 0 },
        description: 'A squishy green blob that bounces around.'
    },
    'goblin': {
        name: 'Cave Goblin',
        emoji: '👹',
        level: 3,
        health: 45,
        attack: 12,
        defense: 6,
        speed: 8,
        rewards: { moolah: [25, 50], exp: [25, 40], gems: 1 },
        description: 'A sneaky goblin with sharp claws.'
    },
    'orc': {
        name: 'Fierce Orc',
        emoji: '🧌',
        level: 5,
        health: 75,
        attack: 18,
        defense: 10,
        speed: 6,
        rewards: { moolah: [50, 100], exp: [40, 60], gems: 2 },
        description: 'A massive orc warrior with a club.'
    },
    'troll': {
        name: 'Mountain Troll',
        emoji: '🧟',
        level: 8,
        health: 120,
        attack: 25,
        defense: 15,
        speed: 4,
        rewards: { moolah: [100, 200], exp: [60, 100], gems: 3 },
        description: 'A huge troll that regenerates health.'
    },
    'dragon': {
        name: 'Ancient Dragon',
        emoji: '🐉',
        level: 15,
        health: 250,
        attack: 40,
        defense: 25,
        speed: 12,
        rewards: { moolah: [300, 500], exp: [150, 250], gems: 10 },
        description: 'A legendary dragon with devastating fire breath.'
    }
};

const BOSSES = {
    'king_slime': {
        name: 'King Slime',
        emoji: '👑🟢',
        level: 10,
        health: 200,
        attack: 30,
        defense: 20,
        speed: 8,
        rewards: { moolah: [200, 400], exp: [100, 150], gems: 5 },
        description: 'The ruler of all slimes, massive and powerful.',
        cooldown: 6 * 60 * 60 * 1000, // 6 hours
        requiredLevel: 10
    },
    'demon_lord': {
        name: 'Demon Lord',
        emoji: '😈',
        level: 20,
        health: 400,
        attack: 50,
        defense: 30,
        speed: 15,
        rewards: { moolah: [500, 1000], exp: [200, 300], gems: 15 },
        description: 'The ultimate evil, master of darkness and destruction.',
        cooldown: 12 * 60 * 60 * 1000, // 12 hours
        requiredLevel: 20
    }
};

class BattleEngine {
    constructor(character1, character2, isNPC = false) {
        this.char1 = { ...character1 };
        this.char2 = { ...character2 };
        this.isNPC = isNPC;
        this.turnCounter = 0;
        this.battleLog = [];
        
        // Initialize current HP
        this.char1.currentHP = this.char1.health;
        this.char2.currentHP = this.char2.health;
    }

    calculateDamage(attacker, defender) {
        // Base damage with randomness
        const baseDamage = Math.floor(Math.random() * attacker.attack) + 1;
        
        // Defense mitigation (max 50% damage reduction)
        const defense = Math.min(defender.defense, attacker.attack * 0.5);
        const finalDamage = Math.max(1, baseDamage - defense);
        
        return Math.floor(finalDamage);
    }

    executeTurn() {
        this.turnCounter++;
        
        // Determine who goes first (speed-based with randomness)
        const char1Initiative = this.char1.speed + Math.random() * 10;
        const char2Initiative = this.char2.speed + Math.random() * 10;
        
        let firstAttacker, secondAttacker;
        if (char1Initiative >= char2Initiative) {
            firstAttacker = { char: this.char1, name: this.char1.name, target: this.char2 };
            secondAttacker = { char: this.char2, name: this.char2.name, target: this.char1 };
        } else {
            firstAttacker = { char: this.char2, name: this.char2.name, target: this.char1 };
            secondAttacker = { char: this.char1, name: this.char1.name, target: this.char2 };
        }

        const turnLog = [];

        // First attack
        if (firstAttacker.char.currentHP > 0) {
            const damage1 = this.calculateDamage(firstAttacker.char, firstAttacker.target);
            firstAttacker.target.currentHP -= damage1;
            turnLog.push(`${firstAttacker.name} attacks ${firstAttacker.target.name} for ${damage1} damage!`);
            
            if (firstAttacker.target.currentHP <= 0) {
                firstAttacker.target.currentHP = 0;
                turnLog.push(`${firstAttacker.target.name} has been defeated!`);
                this.battleLog.push(...turnLog);
                return { winner: firstAttacker.char, loser: firstAttacker.target };
            }
        }

        // Second attack (if first attacker didn't win)
        if (secondAttacker.char.currentHP > 0) {
            const damage2 = this.calculateDamage(secondAttacker.char, secondAttacker.target);
            secondAttacker.target.currentHP -= damage2;
            turnLog.push(`${secondAttacker.name} attacks ${secondAttacker.target.name} for ${damage2} damage!`);
            
            if (secondAttacker.target.currentHP <= 0) {
                secondAttacker.target.currentHP = 0;
                turnLog.push(`${secondAttacker.target.name} has been defeated!`);
                this.battleLog.push(...turnLog);
                return { winner: secondAttacker.char, loser: secondAttacker.target };
            }
        }

        this.battleLog.push(...turnLog);
        return null; // Battle continues
    }

    getBattleEmbed() {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle(`⚔️ Battle - Turn ${this.turnCounter}`)
            .addFields(
                {
                    name: `${this.char1.emoji || '⚔️'} ${this.char1.name}`,
                    value: `HP: ${this.char1.currentHP}/${this.char1.health}\nATK: ${this.char1.attack} | DEF: ${this.char1.defense} | SPD: ${this.char1.speed}`,
                    inline: true
                },
                {
                    name: '🆚',
                    value: '\u200B',
                    inline: true
                },
                {
                    name: `${this.char2.emoji || '⚔️'} ${this.char2.name}`,
                    value: `HP: ${this.char2.currentHP}/${this.char2.health}\nATK: ${this.char2.attack} | DEF: ${this.char2.defense} | SPD: ${this.char2.speed}`,
                    inline: true
                }
            );

        if (this.battleLog.length > 0) {
            const recentLog = this.battleLog.slice(-4).join('\n');
            embed.addFields({ name: '📜 Battle Log', value: recentLog });
        }

        return embed;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Engage in various types of battles!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('npc')
                .setDescription('Fight against NPCs')
                .addStringOption(option =>
                    option.setName('enemy')
                        .setDescription('Choose an enemy to fight')
                        .setRequired(true)
                        .addChoices(
                            { name: '🟢 Green Slime (Lvl 1)', value: 'slime' },
                            { name: '👹 Cave Goblin (Lvl 3)', value: 'goblin' },
                            { name: '🧌 Fierce Orc (Lvl 5)', value: 'orc' },
                            { name: '🧟 Mountain Troll (Lvl 8)', value: 'troll' },
                            { name: '🐉 Ancient Dragon (Lvl 15)', value: 'dragon' }
                        ))
                .addStringOption(option =>
                    option.setName('character')
                        .setDescription('Your character to fight with')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('boss')
                .setDescription('Challenge powerful bosses')
                .addStringOption(option =>
                    option.setName('boss')
                        .setDescription('Choose a boss to challenge')
                        .setRequired(true)
                        .addChoices(
                            { name: '👑🟢 King Slime (Lvl 10)', value: 'king_slime' },
                            { name: '😈 Demon Lord (Lvl 20)', value: 'demon_lord' }
                        ))
                .addStringOption(option =>
                    option.setName('character')
                        .setDescription('Your character to fight with')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('arena')
                .setDescription('Quick PvP battles')
                .addUserOption(option =>
                    option.setName('opponent')
                        .setDescription('User to battle against')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('character')
                        .setDescription('Your character to fight with')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View your battle statistics')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // Add base experience
        exp.addExp(userId, 5);

        switch (subcommand) {
            case 'npc':
                await handleNPCBattle(interaction, userId);
                break;
            case 'boss':
                await handleBossBattle(interaction, userId);
                break;
            case 'arena':
                await handleArenaBattle(interaction, userId);
                break;
            case 'stats':
                await handleBattleStats(interaction, userId);
                break;
        }
    }
};

async function handleNPCBattle(interaction, userId) {
    const enemyKey = interaction.options.getString('enemy');
    const characterName = interaction.options.getString('character');

    const npcData = NPCS[enemyKey];
    if (!npcData) {
        return interaction.reply({
            content: '❌ Invalid enemy selected!',
            flags: 64 // MessageFlags.Ephemeral
        });
    }

    // Find user's character - try exact match first, then partial
    let userCharacter = await CharacterDatabase.findOne({
        where: { 
            name: characterName,
            owner: userId
        }
    });

    // If exact match fails, try partial match
    if (!userCharacter) {
        userCharacter = await CharacterDatabase.findOne({
            where: { 
                name: { [Op.like]: `%${characterName}%` },
                owner: userId
            }
        });
    }

    if (!userCharacter) {
        // Get all user's characters for helpful error message
        const userCharacters = await CharacterDatabase.findAll({
            where: { owner: userId },
            attributes: ['name']
        });
        
        const characterList = userCharacters.length > 0 
            ? userCharacters.map(c => c.name).join(', ')
            : 'none (use `/invite` to recruit characters)';
            
        return interaction.reply({
            content: `❌ You don't own a character named "${characterName}"!\n**Your characters:** ${characterList}`,
            flags: 64 // MessageFlags.Ephemeral
        });
    }

    // Debug: Log character data
    console.log('Found character:', {
        name: userCharacter.name,
        health: userCharacter.health,
        attack: userCharacter.attack,
        defense: userCharacter.defense,
        speed: userCharacter.speed
    });

    // Ensure character has valid stats (set defaults if missing)
    const playerCharacter = {
        id: userCharacter.id,
        name: userCharacter.name,
        emoji: '⚔️', // Default emoji for player characters
        health: userCharacter.health || 50,
        attack: userCharacter.attack || 10,
        defense: userCharacter.defense || 5,
        speed: userCharacter.speed || 5,
        experience: userCharacter.experience || 0
    };

    // Create NPC enemy
    const npcEnemy = {
        name: npcData.name,
        emoji: npcData.emoji,
        health: npcData.health,
        attack: npcData.attack,
        defense: npcData.defense,
        speed: npcData.speed
    };

    // Start battle
    const battleEngine = new BattleEngine(playerCharacter, npcEnemy, true);
    await runBattle(interaction, battleEngine, userId, npcData.rewards);
}

async function handleBossBattle(interaction, userId) {
    const bossKey = interaction.options.getString('boss');
    const characterName = interaction.options.getString('character');

    const bossData = BOSSES[bossKey];
    if (!bossData) {
        return interaction.reply({
            content: '❌ Invalid boss selected!',
            ephemeral: true
        });
    }

    // Check level requirement
    const userLevel = level.getLevel(userId);
    if (userLevel < bossData.requiredLevel) {
        return interaction.reply({
            content: `❌ You need to be level ${bossData.requiredLevel} to challenge ${bossData.name}! (You are level ${userLevel})`,
            ephemeral: true
        });
    }

    // Check cooldown
    const lastBattleTime = battleTime.getBattleTimes(userId);
    const timeSinceBattle = Date.now() - lastBattleTime;
    if (timeSinceBattle < bossData.cooldown) {
        const timeLeft = bossData.cooldown - timeSinceBattle;
        return interaction.reply({
            content: `⏰ You must wait ${msToTime(timeLeft)} before challenging another boss!`,
            ephemeral: true
        });
    }

    // Find user's character - try exact match first, then partial
    let userCharacter = await CharacterDatabase.findOne({
        where: { 
            name: characterName,
            owner: userId
        }
    });

    // If exact match fails, try partial match
    if (!userCharacter) {
        userCharacter = await CharacterDatabase.findOne({
            where: { 
                name: { [Op.like]: `%${characterName}%` },
                owner: userId
            }
        });
    }

    if (!userCharacter) {
        // Get all user's characters for helpful error message
        const userCharacters = await CharacterDatabase.findAll({
            where: { owner: userId },
            attributes: ['name']
        });
        
        const characterList = userCharacters.length > 0 
            ? userCharacters.map(c => c.name).join(', ')
            : 'none (use `/invite` to recruit characters)';
            
        return interaction.reply({
            content: `❌ You don't own a character named "${characterName}"!\n**Your characters:** ${characterList}`,
            ephemeral: true
        });
    }

    // Ensure character has valid stats (set defaults if missing)
    const playerCharacter = {
        id: userCharacter.id,
        name: userCharacter.name,
        emoji: '⚔️',
        health: userCharacter.health || 50,
        attack: userCharacter.attack || 10,
        defense: userCharacter.defense || 5,
        speed: userCharacter.speed || 5,
        experience: userCharacter.experience || 0
    };

    // Create boss enemy
    const bossEnemy = {
        name: bossData.name,
        emoji: bossData.emoji,
        health: bossData.health,
        attack: bossData.attack,
        defense: bossData.defense,
        speed: bossData.speed
    };

    // Set battle cooldown
    await battleTime.setBattleTime(userId);

    // Start battle
    const battleEngine = new BattleEngine(playerCharacter, bossEnemy, true);
    await runBattle(interaction, battleEngine, userId, bossData.rewards);
}

async function handleArenaBattle(interaction, userId) {
    const opponent = interaction.options.getUser('opponent');
    const characterName = interaction.options.getString('character');

    if (opponent.id === userId) {
        return interaction.reply({
            content: '❌ You can\'t battle yourself!',
            ephemeral: true
        });
    }

    // Find user's character - try exact match first, then partial
    let userCharacter = await CharacterDatabase.findOne({
        where: { 
            name: characterName,
            owner: userId
        }
    });

    // If exact match fails, try partial match
    if (!userCharacter) {
        userCharacter = await CharacterDatabase.findOne({
            where: { 
                name: { [Op.like]: `%${characterName}%` },
                owner: userId
            }
        });
    }

    if (!userCharacter) {
        // Get all user's characters for helpful error message
        const userCharacters = await CharacterDatabase.findAll({
            where: { owner: userId },
            attributes: ['name']
        });
        
        const characterList = userCharacters.length > 0 
            ? userCharacters.map(c => c.name).join(', ')
            : 'none (use `/invite` to recruit characters)';
            
        return interaction.reply({
            content: `❌ You don't own a character named "${characterName}"!\n**Your characters:** ${characterList}`,
            ephemeral: true
        });
    }

    // Ensure character has valid stats
    const playerCharacter = {
        id: userCharacter.id,
        name: userCharacter.name,
        emoji: '⚔️',
        health: userCharacter.health || 50,
        attack: userCharacter.attack || 10,
        defense: userCharacter.defense || 5,
        speed: userCharacter.speed || 5,
        experience: userCharacter.experience || 0
    };

    // Challenge the opponent
    const challengeEmbed = new EmbedBuilder()
        .setColor('#4ecdc4')
        .setTitle('⚔️ Arena Battle Challenge!')
        .setDescription(`${interaction.user} challenges ${opponent} to a battle!`)
        .addFields(
            { name: 'Challenger', value: `${playerCharacter.name}`, inline: true },
            { name: 'Status', value: 'Waiting for response...', inline: true }
        )
        .setFooter({ text: 'Respond within 30 seconds!' });

    const acceptButton = new ButtonBuilder()
        .setCustomId('accept_battle')
        .setLabel('Accept Battle')
        .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
        .setCustomId('decline_battle')
        .setLabel('Decline')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(acceptButton, declineButton);

    const response = await interaction.reply({
        content: `${opponent}`,
        embeds: [challengeEmbed],
        components: [row]
    });

    const filter = (i) => i.user.id === opponent.id;
    const collector = response.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 30000
    });

    // Track the arena challenge for quit functionality
    commandStateManager.startCommand(
        interaction.channelId,
        userId,
        'arena_challenge',
        [collector],
        () => {
            collector.stop('FORCE_QUIT');
        }
    );

    collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId === 'accept_battle') {
            await buttonInteraction.reply({
                content: 'Type the name of your character to fight with!',
                ephemeral: true
            });

            const msgFilter = (m) => m.author.id === opponent.id;
            const msgCollector = interaction.channel.createMessageCollector({
                filter: msgFilter,
                time: 30000,
                max: 1
            });

            msgCollector.on('collect', async (msg) => {
                // Find opponent's character - try exact match first, then partial
                let opponentCharacter = await CharacterDatabase.findOne({
                    where: { 
                        name: msg.content,
                        owner: opponent.id
                    }
                });

                if (!opponentCharacter) {
                    opponentCharacter = await CharacterDatabase.findOne({
                        where: { 
                            name: { [Op.like]: `%${msg.content}%` },
                            owner: opponent.id
                        }
                    });
                }

                if (!opponentCharacter) {
                    const opponentCharacters = await CharacterDatabase.findAll({
                        where: { owner: opponent.id },
                        attributes: ['name']
                    });
                    
                    const characterList = opponentCharacters.length > 0 
                        ? opponentCharacters.map(c => c.name).join(', ')
                        : 'none (use `/invite` to recruit characters)';
                        
                    return msg.reply(`❌ You don't own a character named "${msg.content}"!\n**Your characters:** ${characterList}`);
                }

                // Ensure opponent character has valid stats
                const opponentPlayer = {
                    id: opponentCharacter.id,
                    name: opponentCharacter.name,
                    emoji: '⚔️',
                    health: opponentCharacter.health || 50,
                    attack: opponentCharacter.attack || 10,
                    defense: opponentCharacter.defense || 5,
                    speed: opponentCharacter.speed || 5,
                    experience: opponentCharacter.experience || 0
                };

                // Start PvP battle
                const battleEngine = new BattleEngine(playerCharacter, opponentPlayer, false);
                await runPvPBattle(interaction, battleEngine, userId, opponent.id);
            });

            msgCollector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.followUp(`${opponent} didn't select a character in time!`);
                }
            });

        } else if (buttonInteraction.customId === 'decline_battle') {
            await buttonInteraction.update({
                content: `${opponent} declined the battle challenge!`,
                embeds: [],
                components: []
            });
        }
    });

    collector.on('end', (collected, reason) => {
        // Stop tracking the command
        commandStateManager.stopCommand(interaction.channelId);
        
        if (reason === 'FORCE_QUIT') {
            interaction.editReply({
                content: '🛑 Battle challenge was stopped by quit command!',
                embeds: [],
                components: []
            });
        } else if (collected.size === 0) {
            interaction.editReply({
                content: 'Battle challenge timed out!',
                embeds: [],
                components: []
            });
        }
    });
}

async function handleBattleStats(interaction, userId) {
    const wins = battleStats.getWins(userId);
    const losses = battleStats.getLosses(userId);
    const winRate = battleStats.getWinRate(userId);
    const userLevel = level.getLevel(userId);

    const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('⚔️ Battle Statistics')
        .addFields(
            { name: '🏆 Wins', value: `${wins}`, inline: true },
            { name: '💀 Losses', value: `${losses}`, inline: true },
            { name: '📊 Win Rate', value: `${winRate}%`, inline: true },
            { name: '⭐ Level', value: `${userLevel}`, inline: true },
            { name: '🎯 Total Battles', value: `${wins + losses}`, inline: true }
        );

    await interaction.reply({ embeds: [embed] });
}

async function runBattle(interaction, battleEngine, userId, rewards) {
    const battleEmbed = battleEngine.getBattleEmbed();
    battleEmbed.setDescription('Battle begins! ⚔️\n*Use `/quit` to stop this battle early*');

    const response = await interaction.reply({ embeds: [battleEmbed] });
    
    // Track this command for quit functionality
    let battleStopped = false;
    const cleanup = () => {
        battleStopped = true;
    };
    
    commandStateManager.startCommand(
        interaction.channelId, 
        userId, 
        'battle', 
        [], // No collectors for this command
        cleanup
    );
    
    let result = null;
    let turns = 0;
    const maxTurns = 20; // Prevent infinite battles

    while (!result && turns < maxTurns && !battleStopped) {
        await wait(2000);
        
        // Check if battle was stopped via quit command
        if (battleStopped) {
            await interaction.followUp('🛑 Battle was stopped by quit command!');
            commandStateManager.stopCommand(interaction.channelId);
            return;
        }
        
        result = battleEngine.executeTurn();
        turns++;

        const updatedEmbed = battleEngine.getBattleEmbed();
        await response.edit({ embeds: [updatedEmbed] });
    }

    // Stop tracking the command
    commandStateManager.stopCommand(interaction.channelId);

    if (result) {
        await processBattleResult(interaction, result, userId, rewards, true);
    } else if (!battleStopped) {
        await interaction.followUp('⏰ Battle timed out after 20 turns!');
    }
}

async function runPvPBattle(interaction, battleEngine, userId1, userId2) {
    const battleEmbed = battleEngine.getBattleEmbed();
    battleEmbed.setDescription('PvP Battle begins! ⚔️');

    const response = await interaction.editReply({ 
        content: '',
        embeds: [battleEmbed],
        components: []
    });
    
    let result = null;
    let turns = 0;
    const maxTurns = 20;

    while (!result && turns < maxTurns) {
        await wait(2000);
        result = battleEngine.executeTurn();
        turns++;

        const updatedEmbed = battleEngine.getBattleEmbed();
        await response.edit({ embeds: [updatedEmbed] });
    }

    if (result) {
        // Determine winner and loser user IDs
        const isUser1Winner = result.winner.name === battleEngine.char1.name;
        const winnerId = isUser1Winner ? userId1 : userId2;
        const loserId = isUser1Winner ? userId2 : userId1;

        await processPvPResult(interaction, result, winnerId, loserId);
    } else {
        await interaction.followUp('⏰ PvP battle timed out after 20 turns!');
    }
}

async function processBattleResult(interaction, result, userId, rewards, isNPC = true) {
    // For NPC battles, check if the winner has an ID (player characters have IDs, NPCs don't)
    const isVictory = result.winner.id !== undefined;
    
    if (isVictory) {
        // Calculate rewards
        const moolahReward = Math.floor(Math.random() * (rewards.moolah[1] - rewards.moolah[0] + 1)) + rewards.moolah[0];
        const expReward = Math.floor(Math.random() * (rewards.exp[1] - rewards.exp[0] + 1)) + rewards.exp[0];
        
        // Give rewards
        await balance.addBalance(userId, moolahReward);
        await exp.addExp(userId, expReward);
        if (rewards.gems > 0) {
            await gems.addGems(userId, rewards.gems);
        }
        
        // Update character experience (only if character has valid ID)
        if (result.winner.id) {
            await CharacterDatabase.update(
                { experience: result.winner.experience + 50 },
                { where: { id: result.winner.id } }
            );
        }

        // Update battle stats
        await battleStats.addWin(userId);

        const victoryEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎉 Victory!')
            .setDescription(`${result.winner.name} has defeated ${result.loser.name}!`)
            .addFields(
                { name: '💰 Moolah Earned', value: `${moolahReward}`, inline: true },
                { name: '⭐ EXP Earned', value: `${expReward}`, inline: true }
            );

        if (rewards.gems > 0) {
            victoryEmbed.addFields({ name: '💎 Gems Earned', value: `${rewards.gems}`, inline: true });
        }

        await interaction.followUp({ embeds: [victoryEmbed] });
    } else {
        // Update battle stats
        await battleStats.addLoss(userId);

        const defeatEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('💀 Defeat!')
            .setDescription(`${result.loser.name} was defeated by ${result.winner.name}!`)
            .addFields({ name: 'Result', value: 'Better luck next time! Your character gained some experience from the battle.' });

        // Give small consolation exp
        await exp.addExp(userId, 10);
        
        // Update character experience (only if character has valid ID)
        if (result.loser.id) {
            await CharacterDatabase.update(
                { experience: result.loser.experience + 10 },
                { where: { id: result.loser.id } }
            );
        }

        await interaction.followUp({ embeds: [defeatEmbed] });
    }
}

async function processPvPResult(interaction, result, winnerId, loserId) {
    // Update battle stats
    await battleStats.addWin(winnerId);
    await battleStats.addLoss(loserId);

    // Reward winner
    await gems.addGems(winnerId, 5);
    await exp.addExp(winnerId, 25);
    await exp.addExp(loserId, 10); // Consolation exp

    // Update character experience (only if characters have valid IDs)
    if (result.winner.id) {
        await CharacterDatabase.update(
            { experience: result.winner.experience + 40 },
            { where: { id: result.winner.id } }
        );
    }
    if (result.loser.id) {
        await CharacterDatabase.update(
            { experience: result.loser.experience + 15 },
            { where: { id: result.loser.id } }
        );
    }

    const resultEmbed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('🏆 PvP Battle Complete!')
        .setDescription(`${result.winner.name} defeats ${result.loser.name} in arena combat!`)
        .addFields(
            { name: '🏆 Winner Rewards', value: '5 gems + 25 EXP', inline: true },
            { name: '🎖️ Participation', value: '10 EXP for trying', inline: true }
        );

    await interaction.followUp({ embeds: [resultEmbed] });
}