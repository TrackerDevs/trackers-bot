const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
// const { clientID, guildID, token } = require('./config.json');
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data);
}
console.log(commands, fs.readdirSync(path.join(__dirname)));
const rest = new REST({ version: '9' }).setToken('');
rest.put(Routes.applicationGuildCommands('886797197931327550', '422108779027496960'), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
