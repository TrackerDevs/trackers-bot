import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi, Machina } from "../lib/machina"
import ids from "../ids.json"

export const reload: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Reload the bot's commands!").setDefaultPermission(false),
    permissions: [
        {
            type: "USER",
            id: ids.recieved.members.Hamziniii.id,
            permission: true
        },
        {
            type: "USER",
            id: ids.recieved.members.AdepT.id,
            permission: true
        }
    ],
    execute: async (interaction: CommandInteraction, bot: Machina) => {
        bot.reloadCommands()
        interaction.reply({
            content: "Commands reloaded!"
        })
    },
    inDev: false 
}