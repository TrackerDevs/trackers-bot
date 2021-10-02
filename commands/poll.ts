import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js"
import { Machi, Machina } from "../lib/machina"
import { replyOrFollowup } from "../lib/util"


export const poll: Machi = {
    data: (new SlashCommandBuilder())
        .setDescription("Create A Poll!")
        .addStringOption(option => option.setName('title')
            .setDescription("Set the title of your poll").setRequired(true))
        .addStringOption(option => option.setName('options')
            .setDescription("Set your poll options, separated by a comma").setRequired(true))
        .addStringOption(option => option.setName('description')
            .setDescription('Add a description to your poll').setRequired(false)),
    execute: async (interaction: CommandInteraction, bot: Machina) => {
        const options = interaction.options.getString('options').split(', ').join(',').split(',')
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('poll.select')
                    .setPlaceholder('Nothing selected')
                    .addOptions(options.map((_, i) => ({label: _, value: _, description: `Option #${i}`}))),
            )        

        await interaction.reply({
            embeds: [new MessageEmbed({ 
                title: `Polls - ${interaction.options.getString('title')}`,
                description: interaction.options.getString('description') || "A poll!", 
                footer: {text: `Poll started by ${interaction.user.username}`}
            })],
            components: [row]
        })

        bot.client.commands.get('poll',)
        
        setTimeout(((i: CommandInteraction) => {
            i.editReply({
                components: [],
                embeds: [new MessageEmbed({
                    title: `Poll - ${interaction.options.getString('title')} Concluded!`,
                    description: interaction.options.getString('description') || "A poll!", 
                    footer: {text: `Poll started by ${interaction.user.username}`}
                })]
            })
        }).bind(null, interaction), 1000 * 10)
    }, 
    selectMenu: {
        select: async (interaction: SelectMenuInteraction, bot: Machina) => {
            // bot.client.commands.get('poll')
            // bot.getCommandSelf(this).storage =
            console.log("potato")
            interaction[replyOrFollowup(interaction)]({
                content: `Received: ${interaction.values.join('\n')}`,
                ephemeral: true
            })

        }
    },

    inDev: false 
}

/**
 * TODO:
 * Possibly create a handler for extra interactions, e.g. interaction with select menu
 * Add interactions to Machi, so when command.interactionName is called, it calls this command's interactions .interactionName(interaction, bot)
 * This makes it so the command doesnt have to stay alive longer than neccessary, and puts the command handling on to the main thing, also no need to remove event listener.
 */