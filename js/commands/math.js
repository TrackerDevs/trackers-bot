"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.math = void 0;
const builders_1 = require("@discordjs/builders");
exports.math = {
    data: (new builders_1.SlashCommandBuilder()).setDescription("a totally awesome math command") // set the decription of the command
        .addSubcommandGroup(// create a new subcommand group
    // create a new subcommand group
    group => group
        .setName("simple") // set the name of the group 
        .setDescription("Simple math operations") // set the description of the command
        .addSubcommand(// Add a sub command
    // Add a sub command
    command => command
        .setName("add") // Set the name of the command
        .setDescription("Add two numbers together") // Set the description of the command
        .addNumberOption(// Add a number option
    // Add a number option
    nOp => nOp
        .setName("num1") // Set the name of the option
        .setDescription("The first number") // Set the description of the option
        .setRequired(true) // Make the option required
    )
        .addNumberOption(// Add nother number option
    // Add nother number option
    nOp => nOp
        .setName("num2") // Set the name of the option
        .setDescription("The second number") // Set the description of the option
        .setRequired(true) // Make the option required
    ))
        .addSubcommand(// Add another sub command within the sub command group
    // Add another sub command within the sub command group
    command => command
        .setName("subtract") // Set the name of the command 
        .setDescription("Subtract two numbers together") // Set the description of the command
        .addNumberOption(// Add a number option
    // Add a number option
    nOp => nOp
        .setName("num1") // Set the name of the option
        .setDescription("The first number") // Set the description of the option
        .setRequired(true) // Make the option required
    )
        .addNumberOption(// Add a number option
    // Add a number option
    nOp => nOp
        .setName("num2") // Set the 
        .setDescription("The second number")
        .setRequired(true))))
        .addSubcommandGroup(group => group
        .setName("complicated")
        .setDescription("Totally complicated math operations")
        .addSubcommand(command => command
        .setName("multiply")
        .setDescription("Multiply two numbers together")
        .addNumberOption(nOp => nOp
        .setName("num1")
        .setDescription("The first number")
        .setRequired(true))
        .addNumberOption(nOp => nOp
        .setName("num2")
        .setDescription("The second number")
        .setRequired(true)))
        .addSubcommand(command => command
        .setName("divide")
        .setDescription("Divide two numbers together")
        .addNumberOption(nOp => nOp
        .setName("num1")
        .setDescription("The first number")
        .setRequired(true))
        .addNumberOption(nOp => nOp
        .setName("num2")
        .setDescription("The second number")
        .setRequired(true)))),
    execute: async (interaction) => {
        interaction.reply("this is a fallback, and should theoretically never run");
    },
    subCommandGroups: {
        simple: {
            add: async (interaction) => {
                interaction.reply("The result of the operation is: " + (interaction.options.getNumber("num1") + interaction.options.getNumber("num2")));
            },
            subtract: async (interaction) => {
                interaction.reply("The result of the operation is: " + (interaction.options.getNumber("num1") - interaction.options.getNumber("num2")));
            }
        },
        complicated: {
            multiply: async (interaction) => {
                interaction.reply("The result of the operation is: " + (interaction.options.getNumber("num1") * interaction.options.getNumber("num2")));
            },
            divide: async (interaction) => {
                interaction.reply("The result of the operation is: " + (interaction.options.getNumber("num1") / interaction.options.getNumber("num2")));
            },
        }
    },
    upload: 0
};
