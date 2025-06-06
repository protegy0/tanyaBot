const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const commandStateManager = require('../../commandStateManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quit')
        .setDescription('Stop the current running command in this channel')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Optional reason for quitting the command')
                .setRequired(false)),

    async execute(interaction) {
        const channelId = interaction.channelId;
        const userId = interaction.user.id;
        const member = interaction.member;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Check if there's an active command
        const activeCommand = commandStateManager.getActiveCommand(channelId);
        if (!activeCommand) {
            return interaction.reply({
                content: '❌ No active command found in this channel to quit.',
                flags: 64 // MessageFlags.Ephemeral
            });
        }

        // Check permissions
        if (!commandStateManager.canQuit(channelId, userId, member)) {
            return interaction.reply({
                content: `❌ You don't have permission to quit this command. Only the command user (<@${activeCommand.userId}>) or server admins can quit it.`,
                ephemeral: true
            });
        }

        // Get command details before quitting
        const commandName = activeCommand.commandName;
        const commandUserId = activeCommand.userId;
        const duration = Math.round((Date.now() - activeCommand.startTime) / 1000);

        // Force quit the command
        const success = await commandStateManager.forceQuit(channelId, userId);

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('🛑 Command Stopped')
                .setDescription(`The **${commandName}** command has been forcefully stopped.`)
                .addFields(
                    { name: '👤 Original User', value: `<@${commandUserId}>`, inline: true },
                    { name: '🛑 Stopped By', value: `<@${userId}>`, inline: true },
                    { name: '⏱️ Duration', value: `${duration} seconds`, inline: true },
                    { name: '📝 Reason', value: reason }
                )
                .setTimestamp();

            // Mention the original command user if it wasn't them who quit
            const content = userId !== commandUserId ? `<@${commandUserId}>` : '';

            await interaction.reply({
                content,
                embeds: [embed]
            });
        } else {
            await interaction.reply({
                content: '⚠️ Command was stopped but there may have been issues with cleanup. Please check if the command is still running.',
                ephemeral: true
            });
        }
    }
};