const { SlashCommandBuilder } = require('discord.js');
const { balance, gems, inviteTime  } = require('../../importantfunctions/mutators.js')

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
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('invitetime')
                .setDescription('reset invite timer')
                .addMentionableOption(option =>
                    option.setName('user')
                        .setDescription('user to reset')
                        .setRequired(true))),
    async execute(interaction) {

        if (interaction.user.id === '295074068581974026') {
            if (interaction.options.getSubcommand() === 'moolah') {
                balance.addBalance(interaction.options.get('user').value, interaction.options.get('amount').value)
                interaction.reply({
                    content: 'given',
                    ephemeral: true,
                })
            } else if (interaction.options.getSubcommand() === 'gems') {
                gems.addGems(interaction.options.get('user').value, interaction.options.get('amount').value)
                interaction.reply({
                    content: 'given',
                    ephemeral: true,
                })
            } else {
                inviteTime.giveInvite(interaction.options.get('user').value)
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