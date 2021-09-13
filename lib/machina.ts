import 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { Client, Collection, CommandInteraction, Intents, Interaction } from 'discord.js'
import * as fs from 'fs'
import { SlashCommandBuilder } from '@discordjs/builders'
import { sleep } from './util'
import path from 'path'

/** Main class that handles command updates and starting the bot */
export class Machina {
    token: string
    rest: REST
    client: Client & {commands?: Collection<String,Machi>}
    client_id: string 
    guild_id: string

    /**
     * 
     * @param TOKEN Token of the bot
     * @param client_id ID of the bot
     * @param guild_id The SINGLE guild you want your commands to go under
     */
    constructor(TOKEN: string, client_id: string, guild_id: string, ...extraIntenets: number[]) {
        this.token = TOKEN;
        this.client_id = client_id
        this.guild_id = guild_id
        this.rest = new REST({version: '9'}).setToken(this.token)
        this.client = new Client({intents: [Intents.FLAGS.GUILDS, ...extraIntenets]})
    }

    /** Starts the bot */
    start() {
        this.client.once('ready', () => {
            console.log('Bot Online!')
        })
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return
        
            const command = this.client.commands.get(interaction.commandName)
        
            if (!command) return
        
            try {
                await command.execute(interaction)
            } catch (error) {
                console.error(error)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
            }
        })

        this.client.login(this.token)
    }

    /** Takes all the files in commands folder, and uploades them to discord (except those with inDev == true)  */

    async updateCommands() {
        this.client.commands = new Collection();
        for (const file of fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js') || file.endsWith('.ts'))) {
            let _command = require(`../commands/${file}`)
            const name = Object.getOwnPropertyNames(_command)[1]
            let command: Machi = _command[name]
            if(!command.inDev && command.data && command.execute) {
                if(command.data.name == undefined)
                    command.data.setName(name)
                console.log(command.data.name, "has been added!")
                this.client.commands.set(command.data.name, command)
            }
        }

        if([...this.client.commands.values()].length < 1)
            return 

        console.log(`=======\nUpdating list of commands in five seconds`)
        for await (let k of (new Array(5)).fill(0).map((v, i) => 5 - i))
            await [console.log(`In ${k}...`), sleep(1000)][1]

        await this.rest.put(Routes.applicationGuildCommands(this.client_id, this.guild_id), { body: this.client.commands.mapValues((v) => v.data.toJSON()) })
            .then(() => console.log("Successfully Updated!"))
            .catch(e => console.error("Looks like there was an error!", e))
    }
}
export interface Machi {
    /** This is for adding in the command information */
    data: Partial<SlashCommandBuilder>,
    /** The function that should be called when activated */
    execute(interaction: CommandInteraction): Promise<void>,
    /** If the command should be sent to discord */
    inDev: boolean
}