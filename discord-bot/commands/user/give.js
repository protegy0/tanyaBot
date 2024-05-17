const { SlashCommandBuilder, Collection } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const userInfo = new Collection()
const economy = require('../../importantfunctions/economy.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('for protegy only')
        .addSubcommand(subcommand =>
            subcommand
                .setName('moolah')
                .setDescription('Give moolah')
                .addMentionableOption(option =>
                    option.setName('user')
                        .setDescription('user to give')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('amount to give')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('gems')
                .setDescription('Give gems')
                .addMentionableOption(option =>
                    option.setName('user')
                        .setDescription('user to give')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('amount to give')
                        .setRequired(true))),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));

        if (interaction.user.id === '295074068581974026') {
            if (interaction.options.getSubcommand() === 'moolah') {
                economy.addBalance(interaction.options.get('user').value, interaction.options.get('amount').value, userInfo)
                interaction.reply({
                    content: 'given',
                    ephemeral: true,
                })
            } else {
                economy.addGems(interaction.options.get('user').value, interaction.options.get('amount').value, userInfo)
                interaction.reply({
                    content: 'given',
                    ephemeral: true,
                })
            }

        } else {
            interaction.reply('no')
        }
    }
}