import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, CommandInteraction } from "discord.js"
import { Machi, Machina, MachiUtil } from "../lib/machina"
import { BirthdayModel } from "../lib/mongo"

export const birthday: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Command for birthday related stuff")
      .addSubcommand(command => command.setName("add").setDescription("Add/Edit your birthday to the database!")
        .addStringOption(sOp => sOp.setName("month").setDescription("The month you were born in. Ex: February").addChoices({ name: 'January', value: 'January'}, { name: 'February', value: 'February'}, { name: 'March', value: 'March'}, { name: 'April', value: 'April'}, { name: 'May', value: 'May'}, { name: 'June', value: 'June'}, { name: 'July', value: 'July'}, { name: 'August', value: 'August'}, { name: 'September', value: 'September'}, { name: 'October', value: 'October'}, { name: 'November', value: 'November'}, { name: 'December', value: 'December'}).setRequired(true))
        .addIntegerOption(nOp => nOp.setName("day").setDescription("The day you were born. Ex: 04").setRequired(true))
        .addIntegerOption(nOp => nOp.setName("year").setDescription("The day you were born. Ex: 2000").setRequired(false)))
      .addSubcommand(command => command.setName("remove").setDescription("Remove your birthday from the database")
        .addBooleanOption(bOp => bOp.setName("confirm").setDescription("Are you sure you would like to delete your birthday from the database").setRequired(true)))
      .addSubcommand(command => command.setName("get").setDescription("Get the birthday of a user!")
        .addUserOption(uOp => uOp.setName("user").setDescription("The name of the user.").setRequired(true))
      ),
    execute: async (interaction: ChatInputCommandInteraction) => {
      if (!interaction.isChatInputCommand()) return;
      interaction.reply({content: interaction.options.getSubcommand() + " recieved", ephemeral: true})
    },
    subCommands: {
      add: async (interaction: ChatInputCommandInteraction, bot: Machina) => {
        if(interaction.options.getInteger("year") > new Date().getFullYear() - 15) {
          interaction.reply({content: interaction.options.getInteger("year") + "? You are a baby, and thus shouldnt be on discord .______.", ephemeral: true})
          return
        } else if (interaction.options.getInteger("year") < 1900) {
          interaction.reply({content: "How are you not dead???", ephemeral: true})
          return
        } else if (interaction.options.getInteger("day") < 1 || interaction.options.getInteger("day") > 31) {
          interaction.reply({content: "You can't be born on that day!", ephemeral: true})
          return
        }

        BirthdayModel.findOneAndUpdate(
          {id: interaction.user.id}, 
          {
            month: interaction.options.getString("month"), 
            day: interaction.options.getInteger("day"),
            year: interaction.options.getInteger("year")
          }, 
          {upsert: true}
        )
          .then(() => {
            interaction[MachiUtil.replyOrFollowup(interaction)]({
              embeds: [{
                author: {
                  name: interaction.user.username,
                  icon_url: interaction.user.avatarURL()
                },
                title: "Birthday Added!",
                description: "Your birthday has been added to the database.",
                fields: [
                  {name: "Month", value: interaction.options.getString("month"), inline: true},
                  {name: "Day", value: "" + interaction.options.getInteger("day"), inline: true},
                  {name: "Year", value: "" + interaction.options.getInteger("year"), inline: true}
                ]
              }]
            }) 
          })
          .catch(console.error)
      },
      remove: async (interaction: ChatInputCommandInteraction, bot: Machina) => {
        // await interaction[MachiUtil.replyOrFollowup(interaction)]("test")
        BirthdayModel.findOneAndUpdate(
          {id: interaction.user.id}, 
          {$unset: {month: 1, day: 1, year: 1}}
        )
          .then(v => {
            if(v?.month) {
              interaction[MachiUtil.replyOrFollowup(interaction)]({
                embeds: [{
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL()
                  },
                  title: "Birthday Removed!", 
                  description: "Your birthday has been removed!",
                  fields: [
                    {name: "Month", value: v?.month, inline: true},
                    {name: "Day", value: "" + v?.day, inline: true},
                    {name: "Year", value: "" + v?.year, inline: true}
                  ]
                }],
                ephemeral: true 
              })
            } else {
              interaction[MachiUtil.replyOrFollowup(interaction)]({
                embeds: [{
                  author: {
                    name: interaction.options.getUser('user').username,
                    icon_url: interaction.options.getUser('user').avatarURL()
                  },
                  title: "Not in the Database!",
                  description: "Your birthday is not in the database, so you cannot remove it!"
                }]
              })
            }
          })
          .catch(console.error)
      },
      get: async (interaction: ChatInputCommandInteraction, bot: Machina) => {   
        BirthdayModel.findOne({id: interaction.options.getUser('user').id}) 
          .then(v => {
            if(v && v.month) {
              interaction[MachiUtil.replyOrFollowup(interaction)]({
                embeds: [{
                  author: {
                    name: interaction.options.getUser('user').username,
                    icon_url: interaction.options.getUser('user').avatarURL()
                  },
                  title: interaction.options.getUser('user').username + "'s Birthday Details!",
                  fields: [
                    {name: "Month", value: v?.month, inline: true},
                    {name: "Day", value: "" + v?.day, inline: true},
                    {name: "Year", value: "" + v?.year, inline: true}
                  ]
                }]
              })
            } else {
              interaction[MachiUtil.replyOrFollowup(interaction)]({
                embeds: [{
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL()
                  },
                  title: "Not in the Database!",
                  description: interaction.options.getUser('user').username + " has not put their birthday into the database!"
                }]
              })  
            }
          })
      },
    },
    upload: 0
}