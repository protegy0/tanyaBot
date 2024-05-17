const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { Users } = require('../../dbObjects')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('finds')
        .setDescription('Check your finds'),
    async execute(interaction) {
        const target = interaction.user.id
        const user = await Users.findOne({ where: { user_id: (target) } });
        const finds = await user.getFinds();


        if (!finds.length) {
            interaction.reply(`${interaction.user.username} has found absolutely nothing!`);
        } else {
            interaction.reply(codeBlock(finds.map(f => `${f.amount} ${f.find.name}`).join('\n')))
        }

    }
}