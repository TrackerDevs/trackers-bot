import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"

import axios from 'axios'

export const joke: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Tells a joke!").addBooleanOption(option => option.setName('private').setDescription('Should this only be sent to you?').setRequired(false)),
    execute: async (interaction: CommandInteraction) => {
        let res = await axios.get('https://official-joke-api.appspot.com/random_joke')
        interaction.reply({content: `${res.data.setup} \n||${res.data.punchline}||`, ephemeral: interaction.options.getBoolean('private')})
    },
    inDev: false 
}