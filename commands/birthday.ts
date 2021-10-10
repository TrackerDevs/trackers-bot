import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"


export const birthday: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Command for birthday related stuff")
      .addSubcommand(command => command.setName("add").setDescription("Add/Edit your birthday to the database!")
        .addStringOption(sOp => sOp.setName("month").setDescription("The month you were born in. Ex: February").addChoices([["January", "01"], ["February", "02"], ["March", "03"], ["April", "04"], ["May", "05"], ["June", "06"], ["July", "07"], ["August", "08"], ["September", "09"], ["October", "10"], ["November", "11"], ["December", "12"]]).setRequired(true))
        .addNumberOption(nOp => nOp.setName("day").setDescription("The day you were born. Ex: 04").setRequired(true))
        .addNumberOption(nOp => nOp.setName("year").setDescription("The day you were born. Ex: 2000").setRequired(true)))
      .addSubcommand(command => command.setName("remove").setDescription("Remove your birthday from the database")
        .addBooleanOption(bOp => bOp.setName("confirm").setDescription("Are you sure you would like to delete your birthday from the database").setRequired(true)))
      .addSubcommand(command => command.setName("get").setDescription("Get the birthday of a user!")
        .addUserOption(uOp => uOp.setName("user").setDescription("The name of the user.").setRequired(true))
      ),
    execute: async (interaction: CommandInteraction) => {
      interaction.reply({content: interaction.options.getSubcommand() + " recieved", ephemeral: true})
      
      switch(interaction.options.getSubcommand()) {
        case "add":
          break;
        case "remove":
          break;
        case "edit":
          break;
        case "get":
          break;
      }
    },
    inDev: false 
}