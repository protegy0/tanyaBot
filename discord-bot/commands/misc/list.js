const { SlashCommandBuilder, codeBlock} = require("discord.js");
const { CharacterDatabase } = require("../../dbObjects");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("List characters"),
    async execute(interaction) {
        const characters = await CharacterDatabase.findAll();
        interaction.reply(codeBlock(characters.map(c => `${c.name}\n${c.image_id}`).join('\n')));
    }
}