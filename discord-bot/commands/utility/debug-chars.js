const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CharacterDatabase } = require('../../dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug-chars')
        .setDescription('Debug: Show your characters with full stats (temporary command)'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Get all user's characters
        const userCharacters = await CharacterDatabase.findAll({
            where: { owner: userId }
        });

        if (userCharacters.length === 0) {
            return interaction.reply({
                content: '❌ You don\'t have any characters! Use `/invite` to recruit your first character.',
                flags: 64 // MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🔍 Your Characters (Debug Info)')
            .setDescription(`Found ${userCharacters.length} character(s):`);

        userCharacters.forEach((char, index) => {
            embed.addFields({
                name: `${index + 1}. ${char.name}`,
                value: `**ID:** ${char.id}\n**HP:** ${char.health}\n**ATK:** ${char.attack}\n**DEF:** ${char.defense}\n**SPD:** ${char.speed}\n**EXP:** ${char.experience}\n**Level:** ${char.level}`,
                inline: true
            });
        });

        embed.setFooter({ text: 'Use these exact names in battle commands' });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};