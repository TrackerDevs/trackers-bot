import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi, MachiUtil } from "../lib/machina"

export const todo: Machi = {
    data: (new SlashCommandBuilder()).setDescription("The command for all your todo needs!")
    .addSubcommand(sC => sC.setName("list").setDescription("List all your todos!"))
    .addSubcommand(sC => sC.setName("add").setDescription("Add a todo to your list!")
        .addStringOption(sO => sO.setName("name").setDescription("The name of your todo").setRequired(true))
        .addStringOption(sO => sO.setName("description").setDescription("The description of your todo").setRequired(false))
        .addStringOption(sO => sO.setName("date").setDescription("The due date of your todo in (mm/dd/yyyy format). If no time is specified, the time will be assumed to be 12:00am.").setRequired(false))
        .addStringOption(sO => sO.setName("time").setDescription("The time that the todo is due. If no date is specified, the date is assumed to be today."))
    ),
    execute: async (interaction: CommandInteraction) => {
        interaction[MachiUtil.replyOrFollowup(interaction)]({
            content: "TODO is being implemented! Please be patient :)\n - ProjectBot Devs",
            ephemeral: true
        })
    },
    subCommands: {
        "list": async (interaction, bot) => {
            
        }, 
        "add": async (interaction, bot) => {

        }
    },
    upload: 1, 

}