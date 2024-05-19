const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { Users } = require('../../dbObjects')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('finds')
        .setDescription('Check your finds')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('User to search')),
    async execute(interaction) {
        let target = ''
        let userName = ''
        if (interaction.options.get('user') === null) {
            target = interaction.user.id
            userName = interaction.user.username
        } else {
            target = interaction.options.get('user').value
            userName = `<@${interaction.options.get('user').value}>`
        }
        const user = await Users.findOne({ where: { user_id: (target) } });
        const finds = await user.getFinds();


        if (!finds.length) {
            interaction.reply(`${userName} has found absolutely nothing!`);
        } else {
            interaction.reply(`${userName}'s collection\n${codeBlock(finds.map(f => `${f.amount} ${f.find.name}`).join('\n'))}`)
        }

    }
}