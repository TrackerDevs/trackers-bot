import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from "discord.js"
import { Machi, Machina } from "../lib/machina"
import { replyOrFollowup } from "../lib/util"


export const poll: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Create A Poll!").addStringOption(option => option.setName('options').setDescription("Set your poll options, separated by a comma").setRequired(true)),
    execute: async (interaction: CommandInteraction, bot: Machina) => {
        const options = interaction.options.getString('options').split(', ').join(',').split(',')
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('poll.select')
                    .setPlaceholder('Nothing selected')
                    .setMinValues(1)
                    .addOptions(options.map(_ => ({label: _, value: _, description: _}))),
            )        
        
        interaction.reply({
            content: 'test poll!',
            components: [row]
        })
    }, 
    selectMenu: {
        select: async (interaction: SelectMenuInteraction) => {
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