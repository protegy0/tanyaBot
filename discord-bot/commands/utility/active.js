const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const commandStateManager = require('../../commandStateManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('active')
        .setDescription('Show active commands in the current channel (Admin only)'),

    async execute(interaction) {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Only administrators can use this command.',
                ephemeral: true
            });
        }

        const channelId = interaction.channelId;
        const activeCommand = commandStateManager.getActiveCommand(channelId);

        if (!activeCommand) {
            return interaction.reply({
                content: '✅ No active commands in this channel.',
                ephemeral: true
            });
        }

        const duration = Math.round((Date.now() - activeCommand.startTime) / 1000);
        
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('📋 Active Command')
            .addFields(
                { name: '🎮 Command', value: activeCommand.commandName, inline: true },
                { name: '👤 User', value: `<@${activeCommand.userId}>`, inline: true },
                { name: '⏱️ Duration', value: `${duration} seconds`, inline: true },
                { name: '🔧 Collectors', value: `${activeCommand.collectors.length}`, inline: true }
            )
            .setFooter({ text: 'Use /quit to stop the active command' })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64 // MessageFlags.Ephemeral
        });
    }
};