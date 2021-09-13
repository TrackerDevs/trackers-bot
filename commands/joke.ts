import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"

import axios from 'axios'

interface jokeapi {
    "error": boolean,
    "category": "Programming" | "Misc" | "Dark" | "Pun" | "Spooky" | "Christmas",
    "type": "single" | "twopart",
    "joke"?: string,
    "setup"?: string, 
    "delivery"?: string,
    "flags": {
        "nsfw": boolean,
        "religious": boolean,
        "political": boolean,
        "racist": boolean,
        "sexist": boolean,
        "explicit": boolean
    },
    "id": number, 
    "safe": boolean,
    "lang": "en" | string
}

export const joke: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Tells a joke!").addBooleanOption(option => option.setName('private').setDescription('Should this only be sent to you?').setRequired(false)),
    execute: async (interaction: CommandInteraction) => {
        // let res = await axios.get('https://official-joke-api.appspot.com/random_joke') // This API endpoind is down
        // interaction.reply({content: `${res.data.setup} \n||${res.data.punchline}||`, ephemeral: interaction.options.getBoolean('private')})
        let res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit')
        let data: jokeapi = res.data

        interaction.reply({
            content: 
                data.type == "single" ? `|| ${data.joke} ||` :
                `${data.setup} \n||${data.delivery}||`, 
            ephemeral: interaction.options.getBoolean('private')
        })
    },
    inDev: false 
}