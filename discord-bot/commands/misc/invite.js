const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder} = require('discord.js');
const { CharacterDatabase, Users } = require('../../dbObjects')
const { inviteTime, gems  } = require('../../importantfunctions/mutators.js')
const invite = new ButtonBuilder()
    .setCustomId('invite')
    .setLabel('Invite')
    .setStyle(ButtonStyle.Primary);
const row  = new ActionRowBuilder()
    .addComponents(invite)
function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + " seconds";
    else if (minutes < 60) return minutes + " minutes";
    else if (hours < 24) return hours + " hours";
    else return days + " days"
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Try your best to invite a character to your party!'),
    async execute(interaction) {
        const userGems = gems.getGems(interaction.user.id)
        if (userGems >= 120) {
            const collectorFilter = i => i.user.id === interaction.user.id
            const characters = await CharacterDatabase.findAll({where: {owner: '0'}})
            const randomNum = Math.floor(Math.random() * characters.length)
            const character = characters[randomNum]
            const characterEmbed = new EmbedBuilder()
                .setColor('#106078')
                .setAuthor({name: 'tanyaBot', iconURL: 'https://i.imgur.com/GdZkpPc.png'})
                .setTitle(character.name)
                .setImage(character.image_id);
            let choice = false;
            const userTime = inviteTime.getInviteTimes(interaction.user.id);
            if ((Date.now() - userTime) >= 43200000) {
                const response = await interaction.reply({embeds: [characterEmbed], components: [row], fetchReply: true,})
                const collector = response.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter: collectorFilter,
                    time: 30_000,
                });
                collector.on('collect', async (interaction) => {
                    const updateChar = await CharacterDatabase.update({
                        owner: `${interaction.user.id}`}, {
                        where: {id: character.id}
                    })
                    if (updateChar > 0) {
                        const user = await Users.findOne({where: {user_id: interaction.user.id}});
                        user.addCharacter(character)
                        interaction.update({embeds: [characterEmbed], components: [], fetchReply: true,})
                        response.reply({
                            content: `${character.name} joined ${interaction.user.username}'s party!`,
                            components: [],
                            embeds: [],
                        })
                        choice = true
                        gems.addGems(interaction.user.id, -120)
                        inviteTime.setInviteTime(interaction.user.id)
                    }

                })

                collector.on('end', () => {
                    if (!choice) {
                        response.edit({
                            content: 'You took too long to respond. They got annoyed and left.',
                            components: [],
                            embeds: [],
                        });
                    }
                })
            } else {
                interaction.reply({
                    content: `You can't seem to find anyone to add to the party... Try coming back in ${msToTime(43200000 - (Date.now() - userTime))}`,
                })
            }
        } else {
            interaction.reply(`You don't have enough gems to recruit someone to the party yet, you need 120 gems!`)
        }





    }
}