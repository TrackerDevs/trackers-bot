import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"
import courses from "../json/courses.json"

export const course: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Get information about UIC courses")
        .addStringOption(sOp => sOp.setName("category").setDescription("The category that you are interested. Example: ").setRequired(true))
        .addStringOption(sOp => sOp.setName("course_num").setDescription("The course number of the class you are interested (Optional)").setRequired(false)), 
    execute: async (interaction: CommandInteraction) => {
        interaction.reply("The result of the operation is: " + (interaction.options.getString("category") + " " + interaction.options.getString("course_num")))
    },
    upload: -1 
}