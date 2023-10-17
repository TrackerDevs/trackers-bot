"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joke = void 0;
const builders_1 = require("@discordjs/builders");
const machina_1 = require("../lib/machina");
const axios_1 = __importDefault(require("axios"));
exports.joke = {
    data: (new builders_1.SlashCommandBuilder()) // Create an instance of the slash command builder class. This is to create the metadata of the commond
        .setDescription("Tells a joke!") // Set the description of the command to "Tells a joke!"
        .addBooleanOption(option => option // Add a boolean option 
        .setName('private') // Set the name of the boolean option. Make sure that it has no spaces, beause this will act like a key. 
        .setDescription('Should this only be sent to you?') // Set the description of the option
        .setRequired(false) // Make it so that this option is not required
    ),
    execute: async (interaction) => {
        // let res = await axios.get('https://official-joke-api.appspot.com/random_joke') // This API endpoind is down at writing
        let res = await axios_1.default.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit'); // use Axios to run an http get requst
        let data = res.data; // Get the data from the request
        if (data.error) // If there is an errr, throw an error (it will be caught in machina.ts)
            throw "Error with joke api!";
        await interaction[machina_1.MachiUtil.replyOrFollowup(interaction)]({
            content: data.type == "single" ? `|| ${data.joke} ||` :
                `${data.setup} \n||${data.delivery}||`,
            ephemeral: interaction.options.getBoolean('private') // ephemeral means that the message will only be send to the user who called the command. Remember, private is an option that the user can manually put in. If the user does not put a value for privte, it will resolve to null which is a falsy vale. 
        });
    },
    upload: 0 // This will tell the program to not send the meta data to discord, since you are currently inDev
};
