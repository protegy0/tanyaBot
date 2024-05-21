const { SlashCommandBuilder,  } = require("discord.js");
const { CharacterDatabase,  } = require("../../dbObjects");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("List characters"),
    async execute(interaction) {
        const characters = await CharacterDatabase.findAll();
        const response = await interaction.reply({content:'yes', fetchReply: true,})
        for (let character of characters) {
            response.reply(`${character.name}\n${character.id}\n${character.image_id}\n${character.owner}`)

        }

    }
}