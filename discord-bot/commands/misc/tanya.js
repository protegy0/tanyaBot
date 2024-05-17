const Booru = require('booru');
const { SlashCommandBuilder, Collection } = require('discord.js');
const {Users} = require("../../dbObjects");
const userInfo = new Collection()
async function addExp(id, amount) {
    const user = userInfo.get(id);
    if (user) {
        user.experience += Number(amount);
        return user.save();
    }
    const newUser = await Users.create({ user_id: id, experience: amount });
    userInfo.set(id, newUser);
    return newUser;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tanya')
        .setDescription('Get a quote or picture from the best MC on the planet!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('picture')
                .setDescription('Get a picture of Tanya'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('quote')
                .setDescription('Get a quote from Tanya')),
    async execute(interaction) {
        const storedUserInfo = await Users.findAll();
        storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
        addExp(interaction.user.id, 15)
        if (interaction.options.getSubcommand() === 'picture') {
            Booru.search('safebooru', ['tanya_degurechaff'], {limit: 1, random: true}).then(
                posts => {
                    for (let post of posts) interaction.reply(post.fileUrl)
                }
            )
        } else {
            let randomNumber = Math.floor(Math.random() * 4)
            switch (randomNumber) {
                case 1:
                    interaction.reply("*Clear with a chance of artillery shells. Visibility is excellent again today, and so a bloody war is taking place.* - Opening scene of episode 8")
                    break
                case 2:
                    interaction.reply("*But we are soldiers, and if orders say we must burn beautiful Arene to the ground, that is what we must do.* - Episode 8")
                    break
                case 3:
                    interaction.reply("*Oh, dearest Lord.....I'M GOING TO SLICE YOU INTO TINY CHUNKS OF FLESH AND FEED YOU TO THE DOGS!!!* - Episode 12")
            }
        }
    }

}