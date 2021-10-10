import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"

export const math: Machi = {
    data: (new SlashCommandBuilder()).setDescription("a totally awesome math command")
      .addSubcommandGroup(
        group => group
          .setName("simple")
          .setDescription("Simple math operations")
          .addSubcommand(
            command => command
              .setName("add")
              .setDescription("Add two numbers together")
              .addNumberOption(
                nOp => nOp
                  .setName("num1")
                  .setDescription("The first number")
                  .setRequired(true)
              )
              .addNumberOption(
                nOp => nOp
                  .setName("num2")
                  .setDescription("The second number")
                  .setRequired(true)
              )
          )
          .addSubcommand(
            command => command
              .setName("subtract")
              .setDescription("Subtract two numbers together")
              .addNumberOption(
                nOp => nOp
                  .setName("num1")
                  .setDescription("The first number")
                  .setRequired(true)
              )
              .addNumberOption(
                nOp => nOp
                  .setName("num2")
                  .setDescription("The second number")
                  .setRequired(true)
              )
          )
      )
      .addSubcommandGroup(
        group => group 
          .setName("complicated")
          .setDescription("Totally complicated math operations")
          .addSubcommand(
            command => command
              .setName("multiply")
              .setDescription("Multiply two numbers together")
              .addNumberOption(
                nOp => nOp
                  .setName("num1")
                  .setDescription("The first number")
                  .setRequired(true)
              )
              .addNumberOption(
                nOp => nOp
                  .setName("num2")
                  .setDescription("The second number")
                  .setRequired(true)
              )
          )
          .addSubcommand(
            command => command
              .setName("divide")
              .setDescription("Divide two numbers together")
              .addNumberOption(
                nOp => nOp
                  .setName("num1")
                  .setDescription("The first number")
                  .setRequired(true)
              )
              .addNumberOption(
                nOp => nOp
                  .setName("num2")
                  .setDescription("The second number")
                  .setRequired(true)
              )
          )
      ),
    execute: async (interaction: CommandInteraction) => {
        interaction.reply("this is a fallback, and should theoretically never run")
    },
    subCommandGroups: {
      simple: {
        add: async (interaction: CommandInteraction) => {
          interaction.reply("The result of the operation is: " + (interaction.options.getNumber("num1") + interaction.options.getNumber("num2")))
        },
        subtract: async (interaction: CommandInteraction) => {
          interaction.reply("The result of the operation is: " + (interaction.options.getNumber("num1") - interaction.options.getNumber("num2")))
        } 
      },
      complicated: {
        multiply: async (interaction: CommandInteraction) => {
          interaction.reply("The result of the operation is: " + (interaction.options.getNumber("num1") * interaction.options.getNumber("num2")))
        }, 
        divide: async (interaction: CommandInteraction) => {
          interaction.reply("The result of the operation is: " + (interaction.options.getNumber("num1") / interaction.options.getNumber("num2")))
        }, 
      }
    },
    inDev: false 
}