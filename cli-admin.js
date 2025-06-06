const readline = require('readline');
const { Users } = require('./discord-bot/dbObjects.js');
const { balance, gems, exp, level } = require('./discord-bot/importantfunctions/mutators.js');

class BotCLI {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.client = null; // Will be set by main bot
    }

    setClient(client) {
        this.client = client;
    }

    start() {
        console.log('\n🤖 TanyaBot CLI Admin Console');
        console.log('=====================================');
        this.showHelp();
        this.promptUser();
    }

    showHelp() {
        console.log('\nAvailable commands:');
        console.log('  help                     - Show this help message');
        console.log('  balance <userID> <amt>   - Add/remove balance from user');
        console.log('  gems <userID> <amt>      - Add/remove gems from user');
        console.log('  exp <userID> <amt>       - Add/remove experience from user');
        console.log('  user <userID>            - Get user information');
        console.log('  users                    - List all users');
        console.log('  send <channelID> <msg>   - Send message to channel');
        console.log('  stats                    - Show bot statistics');
        console.log('  servers                  - List connected servers');
        console.log('  clear                    - Clear console');
        console.log('  exit                     - Exit CLI');
        console.log('');
    }

    promptUser() {
        this.rl.question('admin> ', async (input) => {
            await this.handleCommand(input.trim());
            this.promptUser();
        });
    }

    async handleCommand(input) {
        const args = input.split(' ');
        const command = args[0].toLowerCase();

        try {
            switch (command) {
                case 'help':
                    this.showHelp();
                    break;

                case 'balance':
                    if (args.length < 3) {
                        console.log('Usage: balance <userID> <amount>');
                        break;
                    }
                    await balance.addBalance(args[1], parseInt(args[2]));
                    const newBalance = balance.getBalance(args[1]);
                    console.log(`✅ User ${args[1]} balance updated to: ${newBalance}`);
                    break;

                case 'gems':
                    if (args.length < 3) {
                        console.log('Usage: gems <userID> <amount>');
                        break;
                    }
                    await gems.addGems(args[1], parseInt(args[2]));
                    const newGems = gems.getGems(args[1]);
                    console.log(`✅ User ${args[1]} gems updated to: ${newGems}`);
                    break;

                case 'exp':
                    if (args.length < 3) {
                        console.log('Usage: exp <userID> <amount>');
                        break;
                    }
                    await exp.addExp(args[1], parseInt(args[2]));
                    const newExp = exp.getExp(args[1]);
                    const calcLevel = level.calcLevel(newExp);
                    console.log(`✅ User ${args[1]} exp updated to: ${newExp} (Level ${calcLevel})`);
                    break;

                case 'user':
                    if (args.length < 2) {
                        console.log('Usage: user <userID>');
                        break;
                    }
                    const user = await Users.findOne({ where: { user_id: args[1] } });
                    if (user) {
                        console.log('📊 User Information:');
                        console.log(`  ID: ${user.user_id}`);
                        console.log(`  Balance: ${user.balance}`);
                        console.log(`  Gems: ${user.gems}`);
                        console.log(`  Level: ${user.level}`);
                        console.log(`  Experience: ${user.experience}`);
                    } else {
                        console.log('❌ User not found');
                    }
                    break;

                case 'users':
                    const users = await Users.findAll({ limit: 10 });
                    console.log(`📋 Users (showing first 10 of ${await Users.count()}):`);
                    users.forEach(u => {
                        console.log(`  ${u.user_id} - Bal: ${u.balance}, Gems: ${u.gems}, Lvl: ${u.level}`);
                    });
                    break;

                case 'send':
                    if (args.length < 3) {
                        console.log('Usage: send <channelID> <message>');
                        break;
                    }
                    if (!this.client) {
                        console.log('❌ Discord client not available');
                        break;
                    }
                    const channelId = args[1];
                    const message = args.slice(2).join(' ');
                    try {
                        const channel = await this.client.channels.fetch(channelId);
                        await channel.send(message);
                        console.log(`✅ Message sent to ${channel.name || 'channel'}`);
                    } catch (error) {
                        console.log(`❌ Failed to send message: ${error.message}`);
                    }
                    break;

                case 'stats':
                    const totalUsers = await Users.count();
                    const totalBalance = await Users.sum('balance') || 0;
                    const totalGems = await Users.sum('gems') || 0;
                    console.log('📈 Bot Statistics:');
                    console.log(`  Total Users: ${totalUsers}`);
                    console.log(`  Total Balance: ${totalBalance}`);
                    console.log(`  Total Gems: ${totalGems}`);
                    if (this.client) {
                        console.log(`  Connected Servers: ${this.client.guilds.cache.size}`);
                        console.log(`  Bot Status: ${this.client.user?.presence?.status || 'Online'}`);
                    }
                    break;

                case 'servers':
                    if (!this.client) {
                        console.log('❌ Discord client not available');
                        break;
                    }
                    console.log('🏠 Connected Servers:');
                    this.client.guilds.cache.forEach(guild => {
                        console.log(`  ${guild.name} (${guild.id}) - ${guild.memberCount} members`);
                    });
                    break;

                case 'clear':
                    console.clear();
                    console.log('🤖 TanyaBot CLI Admin Console');
                    console.log('=====================================');
                    break;

                case 'exit':
                    console.log('👋 Goodbye!');
                    this.rl.close();
                    return;

                case '':
                    break;

                default:
                    console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    close() {
        this.rl.close();
    }
}

module.exports = BotCLI;