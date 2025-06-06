const { Collection } = require('discord.js');

// Global command state tracking
class CommandStateManager {
    constructor() {
        // Map of channel_id -> { userId, commandName, startTime, collectors, cleanup }
        this.activeCommands = new Collection();
    }

    // Start tracking a command
    startCommand(channelId, userId, commandName, collectors = [], cleanup = null) {
        const commandState = {
            userId,
            commandName,
            startTime: Date.now(),
            collectors: collectors || [],
            cleanup: cleanup || (() => {})
        };
        
        this.activeCommands.set(channelId, commandState);
        console.log(`📝 Started tracking command: ${commandName} by ${userId} in channel ${channelId}`);
    }

    // Stop tracking a command
    stopCommand(channelId) {
        const commandState = this.activeCommands.get(channelId);
        if (commandState) {
            console.log(`🛑 Stopped tracking command: ${commandState.commandName} in channel ${channelId}`);
            this.activeCommands.delete(channelId);
            return commandState;
        }
        return null;
    }

    // Get active command in a channel
    getActiveCommand(channelId) {
        return this.activeCommands.get(channelId) || null;
    }

    // Check if user can quit (is command owner or has admin permissions)
    canQuit(channelId, userId, member) {
        const commandState = this.activeCommands.get(channelId);
        if (!commandState) return false;

        // Command owner can always quit
        if (commandState.userId === userId) return true;

        // Check if user has admin permissions
        if (member && (member.permissions.has('Administrator') || member.permissions.has('ManageChannels'))) {
            return true;
        }

        return false;
    }

    // Force quit a command (cleanup collectors, etc.)
    async forceQuit(channelId, quitByUserId = null) {
        const commandState = this.activeCommands.get(channelId);
        if (!commandState) return false;

        console.log(`🚨 Force quitting command: ${commandState.commandName} in channel ${channelId} by user ${quitByUserId}`);

        try {
            // Stop all collectors
            if (commandState.collectors && Array.isArray(commandState.collectors)) {
                commandState.collectors.forEach(collector => {
                    if (collector && typeof collector.stop === 'function') {
                        collector.stop('FORCE_QUIT');
                    }
                });
            }

            // Run cleanup function if provided
            if (commandState.cleanup && typeof commandState.cleanup === 'function') {
                await commandState.cleanup();
            }

            // Remove from tracking
            this.stopCommand(channelId);
            return true;
        } catch (error) {
            console.error('Error during force quit:', error);
            // Still remove from tracking even if cleanup failed
            this.stopCommand(channelId);
            return false;
        }
    }

    // Get all active commands (for debugging)
    getAllActiveCommands() {
        const commands = [];
        this.activeCommands.forEach((state, channelId) => {
            commands.push({
                channelId,
                userId: state.userId,
                commandName: state.commandName,
                duration: Date.now() - state.startTime
            });
        });
        return commands;
    }

    // Auto-cleanup old commands (over 10 minutes)
    cleanupOldCommands() {
        const now = Date.now();
        const maxAge = 10 * 60 * 1000; // 10 minutes

        this.activeCommands.forEach((state, channelId) => {
            if (now - state.startTime > maxAge) {
                console.log(`🧹 Auto-cleaning up old command: ${state.commandName} in channel ${channelId}`);
                this.forceQuit(channelId, 'AUTO_CLEANUP');
            }
        });
    }
}

// Create singleton instance
const commandStateManager = new CommandStateManager();

// Auto-cleanup every 5 minutes
setInterval(() => {
    commandStateManager.cleanupOldCommands();
}, 5 * 60 * 1000);

module.exports = commandStateManager;