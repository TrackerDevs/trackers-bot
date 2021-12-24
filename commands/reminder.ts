import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi, Machina, MachiUtil } from "../lib/machina"

export const reminder: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Reminders via discord!")
      .addSubcommand(
        command => command  
          .setName("add")
          .setDescription("Add a reminder!")
      )
      .addSubcommand(
        command => command
          .setName("remove")
          .setDescription("Remove a reminder!")
      )
      .addSubcommand(
        command => command
          .setName("list")
          .setDescription("List all the reminders that you have currently")
      ),
    execute: async (interaction: CommandInteraction) => {
      interaction[MachiUtil.replyOrFollowup(interaction)]("oops! something went wrong")
    },
    subCommands: {
      add: async (interaction: CommandInteraction, bot: Machina, uuid) => {

      },
      remove: async (interaction: CommandInteraction, bot: Machina, uuid) => {

      },
      list: async (interaction: CommandInteraction, bot: Machina, uuid) => {

      }
    },
    inDev: true 
}