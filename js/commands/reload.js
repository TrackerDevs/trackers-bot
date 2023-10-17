"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reload = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
exports.reload = {
    data: (new builders_1.SlashCommandBuilder()).setDescription("Reload the bot's commands!").setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator),
    execute: async (interaction, bot) => {
        bot.reloadCommands();
        interaction.reply({
            content: "Commands reloaded!"
        });
    },
    upload: 0
};
