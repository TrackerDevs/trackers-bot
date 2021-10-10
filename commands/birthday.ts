import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Machi, Machina, MachiUtil } from "../lib/machina"
import { UserModel } from "../lib/mongo"

export const birthday: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Command for birthday related stuff")
      .addSubcommand(command => command.setName("add").setDescription("Add/Edit your birthday to the database!")
        .addStringOption(sOp => sOp.setName("month").setDescription("The month you were born in. Ex: February").addChoices([["January", "January"], ["February", "February"], ["March", "March"], ["April", "April"], ["May", "May"], ["June", "June"], ["July", "July"], ["August", "August"], ["September", "September"], ["October", "October"], ["November", "November"], ["December", "December"]]).setRequired(true))
        .addIntegerOption(nOp => nOp.setName("day").setDescription("The day you were born. Ex: 04").setRequired(true))
        .addIntegerOption(nOp => nOp.setName("year").setDescription("The day you were born. Ex: 2000").setRequired(true)))
      .addSubcommand(command => command.setName("remove").setDescription("Remove your birthday from the database")
        .addBooleanOption(bOp => bOp.setName("confirm").setDescription("Are you sure you would like to delete your birthday from the database").setRequired(true)))
      .addSubcommand(command => command.setName("get").setDescription("Get the birthday of a user!")
        .addUserOption(uOp => uOp.setName("user").setDescription("The name of the user.").setRequired(true))
      ),
    execute: async (interaction: CommandInteraction) => {
      interaction.reply({content: interaction.options.getSubcommand() + " recieved", ephemeral: true})
    },
    subCommands: {
      add: async (interaction: CommandInteraction, bot: Machina) => {
        UserModel.findOneAndUpdate({
          id: interaction.user.id
        }, {
          birthday: {
            month: interaction.options.getString("month"), 
            day: interaction.options.getInteger("day"),
            year: interaction.options.getInteger("year")
          }
        }, {upsert: true})
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
      remove: async (interaction: CommandInteraction, bot: Machina) => {},
      get: async (interaction: CommandInteraction, bot: Machina) => {
        interaction.reply("potato")
        UserModel.find().exec().then(console.log)
      },
    },
    inDev: false 
}