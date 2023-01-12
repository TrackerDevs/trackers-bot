import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, PermissionFlagsBits } from "discord.js"
import { Machi } from "../lib/machina"


export const say: Machi = {
  data: (new SlashCommandBuilder()).setDescription("Tells the bot to say something").setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(sI => sI
    .setName("title")
    .setDescription("The title of the message")
    .setRequired(true)
  ).addStringOption(sI => sI
    .setName("content")
    .setDescription("The content of the message")
    .setRequired(true) 
  ),
  execute: async (interaction) => {
    const title = interaction.options.getString("title")
    const content = interaction.options.getString("content")
    const user = await interaction.user.fetch(true)
    interaction.reply({embeds: [{
      title: title,
      description: content,
      author: {
        name: user.username,
        icon_url: user.avatarURL() 
      },
      color: user.accentColor
    }]})
  },
  upload: 0
}