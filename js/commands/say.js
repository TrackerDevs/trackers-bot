"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.say = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
exports.say = {
    data: (new builders_1.SlashCommandBuilder()).setDescription("Tells the bot to say something").setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .addStringOption(sI => sI
        .setName("title")
        .setDescription("The title of the message")
        .setRequired(true)).addStringOption(sI => sI
        .setName("content")
        .setDescription("The content of the message")
        .setRequired(true)),
    execute: async (interaction) => {
        const title = interaction.options.getString("title");
        const content = interaction.options.getString("content");
        const user = await interaction.user.fetch(true);
        interaction.reply({ embeds: [{
                    title: title,
                    description: content,
                    author: {
                        name: user.username,
                        icon_url: user.avatarURL()
                    },
                    color: user.accentColor
                }] });
    },
    upload: 0
};
