import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js"
import { Machi, MachiUtil, Machina } from "../lib/machina"


export const poll: Machi = {
    data: (new SlashCommandBuilder())
        .setDescription("Create A Poll!")
        .addStringOption(option => option.setName('title')
            .setDescription("Set the title of your poll").setRequired(true))
        .addStringOption(option => option.setName('options')
            .setDescription("Set your poll options, separated by a comma").setRequired(true))
        .addStringOption(option => option.setName('description')
            .setDescription('Add a description to your poll').setRequired(false)),
    execute: async (interaction: CommandInteraction, bot: Machina, uuid: string) => {
        const options = interaction.options.getString('options').split(', ').join(',').split(',')
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(MachiUtil.customIdMaker(this, "select", uuid))
                    .setPlaceholder('Nothing selected')
                    .addOptions(options.map((_, i) => ({label: _, value: _, description: `Option #${i + 1}`}))),
            )        

        await interaction.reply({
            embeds: [new MessageEmbed({ 
                title: `Polls - ${interaction.options.getString('title')}`,
                description: interaction.options.getString('description') || "A poll!", 
                footer: {text: `Poll started by ${interaction.user.username}`}
            })],
            components: [row]
        })
        setTimeout((async (i: CommandInteraction) => {
            console.log(MachiUtil.getSelf(this, bot).storage)
            await i.editReply({
                components: [],
                embeds: [new MessageEmbed({
                    title: `Poll - ${interaction.options.getString('title')} Concluded!`,
                    description: interaction.options.getString('description') || "A poll!",
                    fields: [{
                        name: "Results",
                        value: (Object.entries([...MachiUtil.getStorageInstance(this, bot, uuid).values()].reduce((prev, curr) => [prev, prev[curr] = (prev[curr] || 0 ) + 1][0], {})) as [string, number][]).map(_ => `${_[0]} recieved ${_[1]} ${_[1] == 1 ? "vote" : "votes"}`).join(", "),
                        inline: true 
                    }],
                    footer: {text: `Poll started by ${interaction.user.username}`}
                })]
            })
            MachiUtil.deleteStorage(this, bot)
        }).bind(null, interaction), 1000 * 30)
    }, 
    selectMenu: {
        select: async (interaction: SelectMenuInteraction, bot: Machina, uuid: string) => {
            MachiUtil.getStorageInstance(this, bot, uuid).set(interaction.user.username, interaction.values.join(", "))

            interaction[MachiUtil.replyOrFollowup(interaction)]({
                content: `Received: ${interaction.values.join('\n')}`,
                ephemeral: true
            })

        }
    },

    upload: 0 
}

/**
 * TODO:
 * Possibly create a handler for extra interactions, e.g. interaction with select menu
 * Add interactions to Machi, so when command.interactionName is called, it calls this command's interactions .interactionName(interaction, bot)
 * This makes it so the command doesnt have to stay alive longer than neccessary, and puts the command handling on to the main thing, also no need to remove event listener.
 */