import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"
// import courses from "../json/courses.json"
import courses from "../json/cs_courses.json"

export const course: Machi = {
  data: (new SlashCommandBuilder()).setDescription("Get information about UIC courses")
    // .addStringOption(sOp => sOp.setName("category").setDescription("The category that you are interested. Example: ").setRequired(true))
    // .addStringOption(sOp => sOp.setName("course_num").setDescription("The course number of the class you are interested (Optional)").setRequired(false)), 
    .addSubcommandGroup(
      group => group
        .setName("cs")
        .setDescription("Computer Science Courses")
        .addSubcommand(
          command => command
            .setName("list")
            .setDescription("List all the courses in the Computer Science department")
        )
        .addSubcommand(
          command => command
            .setName("info")
            .setDescription("Get information about a specific course")
            .addNumberOption(nOp => nOp.setName("course_num").setDescription("The course number of the class you are interested in. E.g. \`401\` for CS 401").setRequired(true))
        )
    ),
  execute: async (interaction) => {
    interaction.reply("this is a fallback, and should theoretically never rrrrrun")
  },
  subCommandGroups: {
    cs: {
      list: async (interaction: ChatInputCommandInteraction) => {
        const user = await interaction.user.fetch(true)

        interaction.reply({content: "Here are all the courses in the Computer Science department", embeds: [{
          title: "Computer Science Courses",
          description: Object.values(courses).map(field => `\`${field.number}\` — ${field.title}`).join("\n"),
          author: {
            name: user.username,
            icon_url: user.avatarURL() 
          },
          color: user.accentColor
        }]})
      }, 
      info: async (interaction: ChatInputCommandInteraction) => {
        const user = await interaction.user.fetch(true)
        const courseNum = interaction.options.getNumber("course_num")
        const course: typeof courses['CS 100'] = courses['CS ' + courseNum]
        if (course) {
          interaction.reply({embeds: [{
            title: course.number + " — " + course.title,
            description: course.desc,
            author: {
              name: user.username,
              icon_url: user.avatarURL() 
            },
            color: user.accentColor
          }]})
        } else {
          interaction.reply({content: "I couldn't find that course, sorry!"})
        }
      }
    }
  },
  upload: 0
}