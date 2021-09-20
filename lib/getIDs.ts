// THIS IS SUPPOSED TO BE USED LOCALLY, NOT IN PRODUCTION

import { Machina } from "./machina";
import ids from "../ids.json"
import fs from 'fs'
import path from 'path'
import { Intents } from "discord.js";

const env = require('dotenv').config({path: path.join(__dirname, "../.env")}).parsed

const bot = new Machina(env['TOKEN'], env['CLIENT_ID'], env['GUILD_ID'], Intents.FLAGS.GUILD_MEMBERS)
bot.login()
bot.client.on('ready', async (client) => {
    const guild = client.guilds.cache.get(env['GUILD_ID'])
    let roles = await guild.roles.fetch()
    let members = await guild.members.fetch()
    let temp 

    for(let role of ids.requesting.roles)
        if((temp = roles.toJSON().filter(v => v.name == role)).length == 1)
            ids.recieved.roles[role] = {name: role, id: temp[0].id}
    for(let member of ids.requesting.members)
        if((temp = members.toJSON().filter(v => v.user.username == member)).length == 1)
            ids.recieved.members[member] = {name: member, id: temp[0].id}

    fs.writeFileSync(path.join(__dirname, "../ids.json"), JSON.stringify(ids, null, 2))
})