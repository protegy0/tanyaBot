const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { Users } = require('../../dbObjects')



module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Check your inventory'),
    async execute(interaction) {
        const target = interaction.user.id
        const user = await Users.findOne({ where: { user_id: (target) } });
        const items = await user.getItems();
        let itemArray = []
        if (!items.length) {
            interaction.reply(`${interaction.user.username} has absolutely nothing!`);
        } else {
            items.map(i => {
                if (i.item === null) {
                    if (i.amount > 0) {
                        itemArray.push(`${i.amount} ${i.gemItem.name}`)
                    }
                } else {
                    if (i.amount > 0) {
                        itemArray.push(`${i.amount} ${i.item.name}`)
                    }
                }
            })
            if (itemArray.length === 0) {
                interaction.reply(`${interaction.user.username} has absolutely nothing!`);
            } else {
                interaction.reply(codeBlock(itemArray.map(i => `${i}`).join('\n')))
            }

        }


    }
}