"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bomb = exports.MachiUtil = exports.Machina = void 0;
require("discord.js");
const discord_js_1 = require("discord.js");
// import { REST } from '@discordjs/rest'
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("./util");
const path_1 = __importDefault(require("path"));
const nodemailer_1 = require("nodemailer");
const v10_1 = require("discord-api-types/v10");
/** Main class that handles command updates and starting the bot */
class Machina {
    /**
     * Makes an instance of the Machina class
     * @param TOKEN Token of the bot
     * @param client_id ID of the bot
     * @param guild_id The SINGLE guild you want your commands to go under
     */
    constructor(TOKEN, client_id, guild_id, mail_user, mail_pass, extraIntenets = []) {
        this.storage = new Map();
        this.token = TOKEN;
        this.client_id = client_id;
        this.guild_id = guild_id;
        this.rest = new discord_js_1.REST({ version: '9' }).setToken(this.token);
        this.client = new discord_js_1.Client({ intents: [v10_1.GatewayIntentBits.Guilds, ...extraIntenets] });
        if (mail_user && mail_pass)
            this.mailer = (0, nodemailer_1.createTransport)({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: mail_user,
                    pass: mail_pass
                }
            });
    }
    /** Starts the bot */
    start() {
        if (!this.client.commands) // Checks to see if the commands have already been added
            this.reloadCommands(); // If not, then reload (technically load in this case) the commands
        this.client.once('ready', () => {
            console.log('Bot Online!'); // log that the bot is online
        });
        this.client.on('interactionCreate', async (interaction) => {
            // console.log(interaction.user.username)
            const error = (e) => interaction.isRepliable() ? [interaction.reply({ content: `Uh Oh! The devs made a mistake while creating this command.${e ? 'Some extra info: ' + e : ''}`, ephemeral: true }), console.error(e)] : (0, util_1.noop)();
            if (interaction.isChatInputCommand()) { // If its a command 
                const command = this.client.commands.get(interaction.commandName); // Check to see if the command they ran corresponds to a command in the cache
                if (!command)
                    return; // If not, return 
                try {
                    if (interaction.options['_group'] && command.subCommandGroups)
                        if (command.subCommandGroups[interaction.options['_group']])
                            if (command.subCommandGroups[interaction.options['_group']][interaction.options['_subcommand']])
                                await command.subCommandGroups[interaction.options['_group']][interaction.options['_subcommand']](interaction, this, crypto_1.default.randomUUID());
                            else
                                await command.execute(interaction, this, crypto_1.default.randomUUID());
                        else
                            await command.execute(interaction, this, crypto_1.default.randomUUID());
                    else if (interaction.options['_subcommand'] && command.subCommands)
                        if (command.subCommands[interaction.options['_subcommand']])
                            await command.subCommands[interaction.options['_subcommand']](interaction, this, crypto_1.default.randomUUID());
                        else
                            await command.execute(interaction, this, crypto_1.default.randomUUID()); // Try to run the command 
                    else
                        await command.execute(interaction, this, crypto_1.default.randomUUID()); // Try to run the command 
                }
                catch (error) {
                    console.error(error); // If there is an error, log it out
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }); // Reply to the user saying that there was an error
                }
            }
            else if (interaction.isModalSubmit()) {
                let [commandName, interactionName, uuid] = interaction.customId.split('.'); // Separate the command name and the interaction name
                let command = this.client.commands.get(commandName)['modalSubmit']; // Get select menu handler form the command (if there is one that is)
                if (command[interactionName]) // If the particular select menu interaction exists
                    try {
                        command[interactionName](interaction, this, uuid); // Then run it!
                    }
                    catch (error) {
                        console.error(error); // If there is an error, log it out
                        error(error);
                    }
                else
                    await error(); // Else error 
            }
            else if (interaction.isMessageComponent()) { // Check to see if the interaction is a message component
                let [commandName, interactionName, uuid] = interaction.customId.split('.'); // Separate the command name and the interaction name
                let command;
                console.log(interactionName, commandName, uuid);
                try {
                    if (interaction.isButton()) { // Check to see if its a button action
                        command = this.client.commands.get(commandName)['button']; // Get button handlers from the command (if there is one that is)
                        if (command[interactionName]) // If the particular button interaction exists
                            command[interactionName](interaction, this, uuid); // THen run it!
                        else
                            await error(); // Else error
                    }
                    if (interaction.isContextMenuCommand()) { // Check to see if its a context menu action
                        command = this.client.commands.get(commandName)['contextMenu']; // Get context handlers from the command (if there is one that is)
                        if (command[interactionName]) // If the particular context menu interaction exists 
                            command[interactionName](interaction, this, uuid); // Then run it!
                        else
                            await error(); // Else error
                    }
                    if (interaction.isAnySelectMenu()) { // Check to see if its a select menu action
                        command = this.client.commands.get(commandName)['selectMenu']; // Get select menu handler form the command (if there is one that is)
                        if (command[interactionName]) // If the particular select menu interaction exists
                            command[interactionName](interaction, this, uuid); // Then run it!
                        else
                            await error(); // Else error 
                    }
                }
                catch (e) {
                    console.error(`Error running interaction! ${e}`, commandName, interactionName, uuid, interaction.customId);
                    await interaction.reply({ content: 'Uh Oh! Your interaction did not go through!', ephemeral: true });
                }
            }
        });
        this.login(); // Logs the bot in!
    }
    /** Logs in the bot ONLY */
    async login() {
        if (!this.loggedIn) { // Check to see if the bot is already logged in
            await this.client.login(this.token); // Wait for the bot to log in 
            this.loggedIn = true; // Set logged in to true
        }
    }
    /** Reloads or Uploads the commands in the bot that are in the commands folder */
    reloadCommands() {
        if (this.client.commands) // Check to see if the command cache exists
            delete this.client.commands; // If so, delete it
        this.client.commands = new discord_js_1.Collection(); // Create a new cache
        for (const file of fs_1.default.readdirSync(path_1.default.join(__dirname, '../commands')).filter(file => file.endsWith('.js') || file.endsWith('.ts'))) { // Get each file from the commands folder
            try {
                // console.log(file) // Log out the file name
                delete require.cache[require.resolve(`../commands/${file}`)]; // Remove the command from the program cache 
                let _command = require(`../commands/${file}`); // Get the contents from the file 
                const name = Object.getOwnPropertyNames(_command)[1]; // Get the name of the command
                let command = _command[name]; // Get the actual command from the file
                if (command.upload > -1 && command.data && command.execute) { // Check to see if the command should be added (not in dev), if the command has data, and if the command has an execute function
                    if (command.data.name == undefined) // If the name is not set
                        command.data.setName(name); // Then set the name 
                    this.client.commands.set(command.data.name, command); // Add the command to the cache
                    console.log(command.data.name, "has been added!"); // Log that it has been added
                }
            }
            catch (error) {
                console.error(`UH OH, error loading ${file}\n Error: ${error}`); // If there is an error somewhere, log it out 
            }
        }
    }
    // TODO: Add ability to have commands in subfolders 1 level deep only and error out on naming conflicts
    /** Takes all the files in commands folder, and uploades them to discord (except those with inDev == true)  */
    async updateCommands() {
        var _a, e_1, _b, _c;
        // return
        this.reloadCommands(); // Reloads the commands 
        if ([...this.client.commands.values()].length < 1) // Check to see if there are any commands in the cache 
            return; // If none, return 
        let _recieved = await this.rest.get(v10_1.Routes.applicationGuildCommands(this.client_id, this.guild_id));
        // console.log(diff(_recieved[8].options[0], this.client.commands.get(_recieved[8].name).data['options'][0])) // TODO, add diff checking between commands
        let recieved = _recieved.map(c => c.name); // Get the names of the commands that are in the discord server
        let newCommands = this.client.commands.filter(v => !recieved.includes(v.data.name) || v.upload == 1).map(v => v.data.name);
        if (newCommands.length == 0)
            return;
        console.log("New commands:\n", newCommands.join("\n"));
        console.log(`=======\nUpdating list of commands in five seconds`); // Create a countdown and wait for five seconds. This is because we don't want to spam discord's API so you have time to stop it.
        try {
            for (var _d = true, _e = __asyncValues((new Array(5)).fill(0).map((v, i) => 5 - i)), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                let k = _c;
                await [console.log(`In ${k}...`), (0, util_1.sleep)(1000)][1];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        await this.login(); // Log in. This is neccessary because we need to know specific information about the command to add in permissions to that command 
        await this.rest.put(v10_1.Routes.applicationGuildCommands(this.client_id, this.guild_id), { body: this.client.commands.mapValues((v) => v.data.toJSON()) }) // Sends the command infromation to discord 
            .then(() => console.log("Successfully Updated!"))
            .catch(e => console.error("Looks like there was an error!", e));
        // try {
        //     let commandNameAndIdsObject: { [name: string]: ApplicationCommand } = {} // Create an object to hold the data
        //     ;(await this.client.guilds.cache.get(this.guild_id)?.commands.fetch())?.toJSON()?.forEach(_ => commandNameAndIdsObject[_.name] = _) // For each command in the guild, get its data
        //     this.client.commands.filter(command => (command?.permissions ?? 0) != 0)?.toJSON()?.forEach(_ => commandNameAndIdsObject[_.data.name]?.permissions?.set({permissions: _.permissions})) // For each command in the cache that has permissions, set the corresponding command in the guild its permissions
        // } catch (e) {
        //     console.error(e);
        // }
    }
}
exports.Machina = Machina;
class MachiUtil {
    static replyOrFollowup(interaction) {
        return (interaction === null || interaction === void 0 ? void 0 : interaction.replied) ? 'followUp' : 'reply';
    }
    static getSelf(self, bot) {
        var _a;
        return (_a = bot.client) === null || _a === void 0 ? void 0 : _a.commands.get(Object.getOwnPropertyNames(self)[1]);
    }
    static getStorage(self, bot) {
        if (bot.storage && !bot.storage.has(Object.getOwnPropertyNames(self)[1]))
            bot.storage.set(Object.getOwnPropertyNames(self)[1], {});
        return bot.storage.get(Object.getOwnPropertyNames(self)[1]);
    }
    static deleteStorage(self, bot) {
        bot.storage.delete(Object.getOwnPropertyNames(self)[1]);
    }
    static storageInstanceExists(self, bot, uuid) {
        return this.getStorage(self, bot)[uuid] != undefined;
    }
    static getStorageInstance(self, bot, uuid) {
        var _a;
        this.getStorage(self, bot);
        if (((_a = bot.client) === null || _a === void 0 ? void 0 : _a.commands) && !this.storageInstanceExists(self, bot, uuid))
            this.getStorage(self, bot)[uuid] = new Map();
        return this.getStorage(self, bot)[uuid];
    }
    static addStorageItem(self, bot, uuid, key, val, lifetime = 1000 * 60) {
        const _ = this.getStorageInstance(self, bot, uuid);
        _.set(key, val);
        (0, util_1.sleep)(lifetime).then(() => _.delete(key));
    }
    static getStorageItem(self, bot, uuid, key) {
        const _ = this === null || this === void 0 ? void 0 : this.getStorageInstance(self, bot, uuid);
        return _ === null || _ === void 0 ? void 0 : _.get(key);
    }
    static deleteStorageInstance(self, bot, uuid) {
        delete this.getStorage(self, bot)[uuid];
    }
    static customIdMaker(self, interactionName, uuid) {
        return `${Object.getOwnPropertyNames(self)[1]}.${interactionName}.${uuid}`;
    }
    static getThis(self) {
        return self[Object.getOwnPropertyNames(self)[1]];
    }
}
exports.MachiUtil = MachiUtil;
class Criminal {
    constructor(obj, prop, ms, jail, uuid) {
        this.execute = setTimeout(((obj, prop, jail, uuid) => {
            delete obj[prop];
            jail.delete(uuid);
        }).bind(null, obj, prop, jail, uuid), ms);
    }
    defer() {
        this.execute.refresh();
    }
}
class Bomb {
    constructor(ms, execute) {
        this.bomb = setTimeout(() => execute(), ms);
    }
    defer() {
        this.bomb.refresh();
    }
    defuse() {
        clearTimeout(this.bomb);
    }
}
exports.Bomb = Bomb;
