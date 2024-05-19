const { SlashCommandBuilder, Collection, codeBlock } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show servers leaderboard')
        .addSubcommand(subcommand =>
            subcommand
                .setName('moolah')
                .setDescription('The moolah leaderboard'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('gems')
                .setDescription('The gem leaderboard'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('level')
                .setDescription('The level leaderboard')),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        if (interaction.options.getSubcommand() === 'moolah') {
            interaction.reply(
                codeBlock(
                    userInfo.sort((a, b) => b.balance - a.balance)
                        .filter(user => interaction.client.users.cache.has(user.user_id))
                        .first(10)
                        .map((user, position) => `(${position + 1}) ${(interaction.client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
                        .join('\n'),
                ),
            )
        } else if (interaction.options.getSubcommand() === 'gems') {
            interaction.reply(
                codeBlock(
                    userInfo.sort((a, b) => b.gems - a.gems)
                        .filter(user => interaction.client.users.cache.has(user.user_id))
                        .first(10)
                        .map((user, position) => `(${position + 1}) ${(interaction.client.users.cache.get(user.user_id).tag)}: ${user.gems}💎`)
                        .join('\n'),
                ),
            )
        } else {
            interaction.reply(
                codeBlock(
                    userInfo.sort((a, b) => b.level - a.level)
                        .filter(user => interaction.client.users.cache.has(user.user_id))
                        .first(10)
                        .map((user, position) => `(${position + 1}) ${(interaction.client.users.cache.get(user.user_id).tag)}: ${user.level}⭐`)
                        .join('\n'),
                ),
            )
        }



    }
}