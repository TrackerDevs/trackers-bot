import { GatewayIntentBits } from 'discord.js'
import mongoose from 'mongoose'
import { Machina } from './lib/machina'
require('dotenv').config() // This is for the token in the .env file 

// Your token, client id of the bot, guild id of where you want the commands to be, and any extra permissions
console.log("⚠  POSSIBLE ISSUE: GUILD_ID putting in \"\"")
const bot = new Machina(process.env['TOKEN'], process.env['CLIENT_ID'], process.env['GUILD_ID'], process.env['MAIL_USER'], process.env['MAIL_PASS'])

// This is a self calling function (aka IIFE): it waits for the commands to updates, then starts the bot
;(async (b) => {
    await mongoose.connect(`mongodb+srv://${process.env['_USERNAME']}:${process.env['_PASSWORD']}` + process.env['URL'], {
        autoIndex: false,
        retryWrites: false,
        keepAlive: true
    })
    .then(() => console.log("Mongo connected!"))
    .catch(r => console.error("Error connecting to mongo! " + r))

    await b.updateCommands() // This is to update the command declerations, you can comment it out if you know that you aren't updating the `data` of any command
    b.start()
})(bot)  