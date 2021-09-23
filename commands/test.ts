import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"

/*
In order to create a command, you essentially replicate what is below.
export const <some name>: Machi = {
    data: new SlashCommandBuilder() and with your added options.
        - Note: if you don't add a name, the name will end up being the variable name
    execture: async (interaction: CommandInteraction) => {
        this is where you put all the command stuff
    }
    inDev: true or false
        - This is so you can manually test your command without it being included the discord command list
}
*/

export const test: Machi = {
    data: (new SlashCommandBuilder()).setDescription("testing stuff and such"),
    execute: async (interaction: CommandInteraction) => {
        interaction.reply("testing! + 1 + 2 + 3")
    },
    inDev: false 
}