"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminder = void 0;
const builders_1 = require("@discordjs/builders");
const machina_1 = require("../lib/machina");
exports.reminder = {
    data: (new builders_1.SlashCommandBuilder()).setDescription("Reminder")
        .addSubcommand(command => command
        .setName("add")
        .setDescription("Add a reminder!"))
        .addSubcommand(command => command
        .setName("remove")
        .setDescription("Remove a reminder!"))
        .addSubcommand(command => command
        .setName("list")
        .setDescription("List all the reminders that you have currently")),
    execute: async (interaction) => {
        interaction[machina_1.MachiUtil.replyOrFollowup(interaction)]("oops! something went wrong");
    },
    subCommands: {
        add: async (interaction, bot, uuid) => {
        },
        remove: async (interaction, bot, uuid) => {
        },
        list: async (interaction, bot, uuid) => {
        }
    },
    upload: 0
};
