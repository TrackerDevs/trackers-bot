"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const machina_1 = require("./lib/machina");
require('dotenv').config(); // This is for the token in the .env file 
// Your token, client id of the bot, guild id of where you want the commands to be, and any extra permissions
console.log("⚠  POSSIBLE ISSUE: GUILD_ID putting in \"\"");
const bot = new machina_1.Machina(process.env['TOKEN'], process.env['CLIENT_ID'], process.env['GUILD_ID'], process.env['MAIL_USER'], process.env['MAIL_PASS']);
(async (b) => {
    await mongoose_1.default.connect(`mongodb+srv://${process.env['_USERNAME']}:${process.env['_PASSWORD']}` + process.env['URL'], {
        autoIndex: false,
        retryWrites: false,
        keepAlive: true
    })
        .then(() => console.log("Mongo connected!"))
        .catch(r => console.error("Error connecting to mongo! " + r));
    await b.updateCommands(); // This is to update the command declerations, you can comment it out if you know that you aren't updating the `data` of any command
    b.start();
})(bot);
