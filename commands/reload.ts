import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, CommandInteraction, PermissionFlagsBits } from "discord.js"
import { Machi, Machina } from "../lib/machina"
import ids from "../ids.json"

export const reload: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Reload the bot's commands!").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (interaction: ChatInputCommandInteraction, bot: Machina) => {
        bot.reloadCommands()
        interaction.reply({
            content: "Commands reloaded!"
        })
    },
    upload: 0 
}