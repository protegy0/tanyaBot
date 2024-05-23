const { SlashCommandBuilder } = require('discord.js');
const { CharacterDatabase } = require('../../dbObjects.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('character')
        .setDescription('Add Character to database')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add character to database')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the character to add')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('imageurl')
                        .setDescription('Image of the character to add')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('Id of character to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit a character in the database')
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('Id of character to edit')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('newname')
                        .setDescription('New name of character')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('newimageurl')
                        .setDescription('New imageurl of character')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('owner')
                        .setDescription('Set new owner')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('points')
                        .setDescription('points to give')
                        .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('delete')
                    .setDescription('Character to delete from database')
                    .addIntegerOption(option =>
                        option
                            .setName('id')
                            .setDescription('Id of character to delete')
                            .setRequired(true))),
    async execute(interaction) {
        if (interaction.user.id === '295074068581974026') {
            if (interaction.options.getSubcommand() === 'add') {
                try {
                    const newChar = await CharacterDatabase.create({
                        name: interaction.options.get('name').value,
                        image_id: interaction.options.get('imageurl').value,
                        id: interaction.options.get('id').value,
                    });
                    interaction.reply(`Character with id ${interaction.options.get('id').value} added`)
                }
                catch (error) {
                    console.log(error)
                    if (error.name === 'SequelizeUniqueConstraintError') {
                        return interaction.reply('That character already exists.');
                    }
                    interaction.reply('something went wrong idk what')
                }
            } else if (interaction.options.getSubcommand() === 'edit') {
                const updatedChar = await CharacterDatabase.update({
                    name: interaction.options.get('newname').value,
                    image_id: interaction.options.get('newimageurl').value,
                    owner: interaction.options.get('owner').value,
                    statpoints: interaction.options.get('points').value }, {
                    where: {id: interaction.options.get('id').value},
                })
                if (updatedChar > 0) {
                    interaction.reply('updated')
                } else {
                    interaction.reply('nope')
                }
            } else if (interaction.options.getSubcommand() === 'delete') {
                const deletedChar = await CharacterDatabase.destroy({ where: {id: interaction.options.get('id').value}});
                if (!deletedChar) {
                    interaction.reply('Character ID does not exist')
                } else {
                    interaction.reply('deleted')
                }
            }


        } else {
            interaction.reply('nah i no wanna')
        }
    }

}
