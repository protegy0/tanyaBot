const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../dbObjects')



module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Check your inventory'),
    async execute(interaction) {
        const target = interaction.user.id
        const user = await Users.findOne({ where: { user_id: (target) } });
        const items = await user.getItems();


        if (!items.length) {
            interaction.reply(`${interaction.user.username} has absolutely nothing!`);
        } else {

            interaction.reply(`${interaction.user.username} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
        }

    }
}