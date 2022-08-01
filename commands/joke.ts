import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import { Machi, MachiUtil } from "../lib/machina"

import axios from 'axios'
interface jokeapi { // This is an interface to set the type of the result of the joke api
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
    data: (new SlashCommandBuilder()) // Create an instance of the slash command builder class. This is to create the metadata of the commond
        .setDescription("Tells a joke!") // Set the description of the command to "Tells a joke!"
        .addBooleanOption(option => option // Add a boolean option 
            .setName('private') // Set the name of the boolean option. Make sure that it has no spaces, beause this will act like a key. 
            .setDescription('Should this only be sent to you?') // Set the description of the option
            .setRequired(false) // Make it so that this option is not required
        ),
    execute: async (interaction: ChatInputCommandInteraction) => { // This is what is to be run when the user calls a command 
        // let res = await axios.get('https://official-joke-api.appspot.com/random_joke') // This API endpoind is down at writing
        let res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit') // use Axios to run an http get requst
        let data: jokeapi = res.data // Get the data from the request
        if(data.error) // If there is an errr, throw an error (it will be caught in machina.ts)
            throw "Error with joke api!"

        await interaction[MachiUtil.replyOrFollowup(interaction)]({ // this will reply or follow up to a message. This is good practice since you cannot guarantee that the message hasnt been replied to previously 
            content: 
                data.type == "single" ? `|| ${data.joke} ||` :
                `${data.setup} \n||${data.delivery}||`, // This sets the content of the message. The ? and : is a ternery operator. 
            ephemeral: interaction.options.getBoolean('private') // ephemeral means that the message will only be send to the user who called the command. Remember, private is an option that the user can manually put in. If the user does not put a value for privte, it will resolve to null which is a falsy vale. 
        })
    },
    upload: 0 // This will tell the program to not send the meta data to discord, since you are currently inDev
}