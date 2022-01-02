import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi, MachiUtil } from "../lib/machina"

export const todo: Machi = {
    data: (new SlashCommandBuilder()).setDescription("The command for all your todo needs!"),
    execute: async (interaction: CommandInteraction) => {
        interaction[MachiUtil.replyOrFollowup(interaction)]({
            content: "TODO is being implemented! Please be patient :)\n - ProjectBot Devs",
            ephemeral: true
        })
    },
    inDev: false 
}