import 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { ApplicationCommand, ApplicationCommandPermissionData, ButtonInteraction, Client, Collection, CommandInteraction, ContextMenuInteraction, Intents, Interaction, MessageComponentInteraction, SelectMenuInteraction } from 'discord.js'
import * as fs from 'fs'
import { SlashCommandBuilder } from '@discordjs/builders'
import { sleep } from './util'
import path from 'path'
import * as ts from 'typescript'
import requireFromString from 'require-from-string'

/** Main class that handles command updates and starting the bot */
export class Machina {
    token: string
    rest: REST
    client: Client & {commands?: Collection<String,Machi>}
    client_id: string 
    guild_id: string
    loggedIn: boolean 

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
        if(!this.client.commands)
            this.reloadCommands()

        this.client.once('ready', () => {
            console.log('Bot Online!')
        })
        this.client.on('interactionCreate', async interaction => {
            if (interaction.isCommand()) {
                const command = this.client.commands.get(interaction.commandName)
            
                if (!command) return
            
                try {
                    await command.execute(interaction, this)
                } catch (error) {
                    console.error(error)
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
                }
            } else if(interaction.isMessageComponent()) {
                // let type: 'button' | 'contextMenu' | 'selectMenu'
                let [commandName, interactionName] = interaction.customId.split('.')
                let command 

                const error = () => interaction.reply({ content: 'Uh Oh! The devs made a mistake while creating this command.', ephemeral: true})

                if(interaction.isButton()) {
                    command = this.client.commands.get(commandName)['button']
                    if(command[interactionName])
                        command[interactionName](interaction, this)
                    else 
                        await error()
                } else if(interaction.isContextMenu()) {
                    command = this.client.commands.get(commandName)['contextMenu']
                    if(command[interactionName])
                        command[interactionName](interaction, this)
                    else 
                        await error()
                } else if(interaction.isSelectMenu()) {
                    command = this.client.commands.get(commandName)['selectMenu']
                    if(command[interactionName])
                        command[interactionName](interaction, this)
                    else 
                        await error()
                }
            }
        })

        this.login()
    }

    /** Logs in the bot ONLY */
    async login() {
        if(!this.loggedIn) {
            await this.client.login(this.token)
            this.loggedIn = true
        }
    }

    /** Reloads or Uploads the commands in the bot that are in the commands folder */
    reloadCommands() {
        if(this.client.commands)
            delete this.client.commands
        console.log(this.client.commands)
        this.client.commands = new Collection();
        // const util = ts.transpileModule(fs.readFileSync(path.join(__dirname, `/lib/util.ts`)).toString('utf-8'), { compilerOptions: { module: ts.ModuleKind.CommonJS }}).outputText.replace('../lib/', './')
        for (const file of fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js') || file.endsWith('.ts'))) {
            // try {
                console.log(file)
                let _command
                // if(file.includes('.js'))
                _command = require(`../commands/${file}`)
                // else if(file.includes('.ts')) {
                //     // FIX UTIL IMPORTS
                                    
                //     let fileTemp = ts.transpileModule(fs.readFileSync(path.join(__dirname, `../commands/${file}`)).toString('utf-8').replace('util', './lib/util.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS }}).outputText.replace('../lib/', './')
                //     console.log(fileTemp)
                //     _command = requireFromString(fileTemp)
                    
                // } 
                // console.log("" + Object.values(_command)[0]['execute'])
                const name = Object.getOwnPropertyNames(_command)[1]
                let command: Machi = _command[name]
                if(!command.inDev && command.data && command.execute) {
                    if(command.data.name == undefined)
                        command.data.setName(name)
                    console.log(command.data.name, "has been added!")
                    this.client.commands.set(command.data.name, command)
                }
            // } catch (error) {
            //     console.error(`UH OH, error loading ${file}\n Error: ${error}`)
            // }
        }
    }

    // TODO: Add ability to have commands in subfolders 1 level deep only and error out on naming conflicts
    /** Takes all the files in commands folder, and uploades them to discord (except those with inDev == true)  */
    async updateCommands() {
        this.reloadCommands()

        if([...this.client.commands.values()].length < 1)
            return 

        console.log(`=======\nUpdating list of commands in five seconds`)
        for await (let k of (new Array(5)).fill(0).map((v, i) => 5 - i))
            await [console.log(`In ${k}...`), sleep(1000)][1]

        await this.rest.put(Routes.applicationGuildCommands(this.client_id, this.guild_id), { body: this.client.commands.mapValues((v) => v.data.toJSON()) })
            .then(() => console.log("Successfully Updated!"))
            .catch(e => console.error("Looks like there was an error!", e))

        await this.login()

        let commandNameAndIdsObject: { [name: string]: ApplicationCommand } = {} // {name: _.name, id: _.id}
        ;(await this.client.guilds.cache.get(this.guild_id)?.commands.fetch()).toJSON().forEach(_ => commandNameAndIdsObject[_.name] = _)
        this.client.commands.filter(command => (command?.permissions ?? 0) != 0).toJSON().forEach(_ => commandNameAndIdsObject[_.data.name].permissions.set({permissions: _.permissions}))
    }


    /** Utility function for a command to get itself from an instance of Machina */
    getCommandSelf(self: Machi) {
        return this.client?.commands.get(Object.getOwnPropertyNames(self)[1])
    }
}
export interface Machi {
    /** This is for adding in the command information */
    data: Partial<SlashCommandBuilder>,
    /** Any permissions you want to add to the bot */
    permissions?: ApplicationCommandPermissionData[]    
    // {
    //     type: "ROLE" | "USER",
    //     /** The id of the role or user itself */
    //     id: string, 
    //     /** Whether to permit them to use the command. True = allow, false = deny */
    //     permission: boolean
    // }[]
    /** The function that should be called when activated */
    execute(interaction: CommandInteraction, bot?: Machina): Promise<void>,
    /** Listen to a button interaction, with the key being name and value being the function to execute */
    button?: {
        [key: string]: (interaction: ButtonInteraction, bot?: Machina) => Promise<void>
    },
    /** Listen to a context menu interaction, with the key being name and value being the function to execute */
    contextMenu?: {
        [key: string]: (interaction: ContextMenuInteraction, bot?: Machina) => Promise<void>
    },
    /** Listen to a select menu component interaction, with the key being name and value being the function to execute */
    selectMenu?: {
        [key: string]: (interaction: SelectMenuInteraction, bot?: Machina) => Promise<void>
    },
    /** If the command data should be sent to discord */
    inDev: boolean,
    /** This is if you want to store data on a command during runtime. Useful for keeping data between execute() and an interaction */
    storage?: {
        [key: string]: any
    }
}

/**
 * TODO
 * [x] figure the guild fetch commands
 * [x] add it so permissions update
 * [x] test out reload command
 * [ ] finish poll
 * [ ] start on new command
 */ 