const { SlashCommandBuilder, Collection, codeBlock } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const currency = new Collection()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show servers leaderboard'),
    async execute(interaction) {
        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => currency.set(b.user_id, b));


        interaction.reply(
            codeBlock(
                currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => interaction.client.users.cache.has(user.user_id))
                    .first(10)
                    .map((user, position) => `(${position + 1}) ${(interaction.client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
                    .join('\n'),
            ),
        )

    }
}