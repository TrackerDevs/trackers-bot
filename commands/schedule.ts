import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"
import { HEX } from "../lib/util"
import axios from "axios"
import { parseSchedule } from "../lib/icsParser"
import { UserModel } from "../lib/mongo"

const forcedVisible = true

const displayScheduleAsFields = (schedule: ReturnType<typeof parseSchedule>) => schedule.map(_ => ({
    name: _.courseName,
    value: `Course ID: \`${_.courseID}\`\nTime: \`${_.startTime}\` - \`${_.endTime}\`\nLocation: \`${_.location}\`\nInstructor: \`${_.instructor}\`\n`,
    inline: false
}))


export const schedule: Machi = {
  data: (new SlashCommandBuilder()).setDescription("Schedule related commands")
    .addSubcommand(
      command => command
        .setName("add")
        .setDescription("Add your schedule!")
        .addAttachmentOption(option => option.setName("schedule").setDescription("Your schedule .ICS file!").setRequired(true))
        .addBooleanOption(option => option.setName("visible").setDescription("Should your schedule be visible to other students?").setRequired(false))
    ).addSubcommand(
      command => command
        .setName("help")
        .setDescription("Get help with the schedule command")
    ).addSubcommand(
      command => command
        .setName("get")
        .setDescription("Get yours or someones schedule (if they allow it)!")
        .addUserOption(option => option.setName("user").setDescription("The user you want to get the schedule of!").setRequired(true))
    ),

  execute: async (interaction: ChatInputCommandInteraction) => {
    interaction.reply("this is a fallback, and should theoretically never run")
  },
  
  subCommands: {
    help: async (interaction: ChatInputCommandInteraction) => {
      interaction.reply("Schedule Help command is under construction!🚧👷‍♀️👷‍♂️")
    },
    add: async (interaction: ChatInputCommandInteraction) => {
      const attachemnt = interaction.options.getAttachment("schedule")
      if(!attachemnt?.name.endsWith(".ics")) {
        interaction.reply({
          embeds: [{
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.avatarURL()
            },
            title: "Attachement Invalid!",
            description: `You uploaded [${attachemnt?.name}]. This is not a proper .ics file! Please try again!`,
            color: HEX.RED
          }], 
          ephemeral: !forcedVisible
        })
        return
      }

      const visible = interaction.options.getBoolean("visible") || true

      const schedule = (await axios.get(attachemnt.url)).data
      const parsedSchedules = parseSchedule(schedule)
      
      if(parsedSchedules.length == 0) {
        interaction.reply({
          embeds: [{
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.avatarURL()
            },
            title: "Empty Schedule!",
            description: `Looks like there are no valid classes! Make sure you uploaded the correct .ics file!`,
            color: HEX.RED
          }], 
          ephemeral: !forcedVisible
        })
        return
      }

      interaction.reply({
        embeds: [{
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.avatarURL()
          },
          title: "Schedule Added!",
          description: `You have successfully added your schedule! Below is your schedule!`,
          color: HEX.GREEN,
          fields: displayScheduleAsFields(parsedSchedules)
        }],
        ephemeral: !forcedVisible
      })

      await UserModel.updateOne(
        {id: interaction.user.id}, 
        {
          $set: {
            scheduleData: {
              schedule: parsedSchedules,
              visible
            }
          }
        },
        {upsert: true}
      )
      .catch(r => console.error("Error adding schedule! " + r))
    },
    get: async (interaction: ChatInputCommandInteraction) => {
      const user = interaction.options.getUser("user")
      const userData = await UserModel.findOne({id: user.id})

      const isSelf = user.id === interaction.user.id
      const avaialable = !!userData && "scheduleData" in userData

      if(!isSelf && (!avaialable || !userData.scheduleData.visible)) {
        interaction.reply({
          embeds: [{
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.avatarURL()
            },
            title: "Schedule Not Available!",
            description: `Looks like ${user.username} either hasn't added their schedule or made it visable yet! Perhaps you should ask them to add it? 👀`,
            color: HEX.RED
          }],
        })
        return 
      }

      if(!userData) {
        interaction.reply({
          embeds: [{
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.avatarURL()
            },
            title: "You aren't verified!",
            description: `C'mon! You aren't verified as a UIC student first. Verify yourself with \`/verify\`!`,
            color: HEX.RED
          }],
        })
        return 
      }

      if(!avaialable) {
        interaction.reply({
          embeds: [{
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.avatarURL()
            },
            title: "You dont have a schedule!",
            description: `C'mon! You can't look at your own schedule if you don't have one! Add one with \`/schedule add\`!`,
            color: HEX.RED
          }],
        })
        return 
      }

      // TODO - make this an actual type
      const userSchedule = userData.scheduleData.schedule as ReturnType<typeof parseSchedule>

      interaction.reply({
        embeds: [{
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.avatarURL()
          },
          title: `Schedule Details of ${user.username}!`,
          // description: `User schedule for ${userSchedule}`,
          fields: displayScheduleAsFields(userSchedule),
          color: HEX.GREEN
        }],
      })
    }
  },
  
  upload: 0
}