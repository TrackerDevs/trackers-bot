import { AnyComponentBuilder, SlashCommandBuilder } from "@discordjs/builders"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, PermissionResolvable, SelectMenuBuilder } from "discord.js"
import { Machi, MachiUtil } from "../lib/machina"
import { MachiButton, MachiButtonRow } from "../lib/meta"


export const admin: Machi = {
  data: (new SlashCommandBuilder())
    .setDescription("Administrator commands")
    .addSubcommandGroup(
      group => group
        .setName("course")
        .setDescription("Course commands")
        .addSubcommand(
          command => command
            .setName("add")
            .setDescription("Add a course cluster (channels, roles, etc.)")
            .addStringOption(sOp => sOp.setName("course_num").setDescription("The course number").setRequired(true))
            .addChannelOption(cOp => cOp.setName("course_channel").setDescription("Positions the new category under the given one").setRequired(true).addChannelTypes(ChannelType.GuildCategory))
            .addRoleOption(rOp => rOp.setName("ab_course_role").setDescription("Positions the new course role under the given one").setRequired(false))
            .addRoleOption(rOp => rOp.setName("ab_ta_role").setDescription("Positions the new ta role under the given one").setRequired(false))
            .addRoleOption(rOp => rOp.setName("ab_tracker_role").setDescription("Positions the new tracker role under the given one").setRequired(false))
            .addRoleOption(rOp => rOp.setName("course_role").setDescription("Role for the class if one has been made").setRequired(false))
            .addRoleOption(rOp => rOp.setName("ta_role").setDescription("Role for the TAs if one has been made").setRequired(false))
            .addRoleOption(rOp => rOp.setName("tracker_role").setDescription("Role for the trackers if one has been made").setRequired(false))
        )
        .addSubcommand(
          command => command
            .setName("remove")
            .setDescription("REMOVES a course cluster (be careful!!!)")
            .addChannelOption(sOp => sOp
              .setName("course_channel").
              setDescription("The course category that you would like to remove (!!!)")
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildCategory)
            )
        )
        .addSubcommand(
          command => command
            .setName("quarantine")
            .setDescription("Remove all users from this course cluster (be careful!)")
            .addChannelOption(sOp => sOp
              .setName("course_channel").
              setDescription("The course category that you would like to quarantine (!)")
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildCategory)
            )
        )
    ).setDefaultMemberPermissions(8),
  execute: async (interaction) => {
    interaction.reply("this is a fallback, and should theoretically never rrrrrun")
  },
  subCommandGroups: {
    course: {
      add: async (interaction, bot, uuid) => {
        const input = interaction.options.getString("course_num")
        const _courseRole = interaction.options.getRole("course_role")
        const _taRole = interaction.options.getRole("ta_role")
        const _trackerRole = interaction.options.getRole("tracker_role")
        const aboveRole = interaction.options.getRole("ab_course_role")
        const aboveTARole = interaction.options.getRole("ab_ta_role")
        const aboveTrackerRole = interaction.options.getRole("ab_tracker_role")
        const aboveChannel = interaction.options.getChannel("course_channel")

        const courseNumRegex = input.match(/(CS [1-5][0-9]{2})/g)

        if (!courseNumRegex) {
          interaction.reply(`Invalid course number. \`${input}\` did not match regex: /(CS [1-5][0-9]{2})/g`)
          return
        }

        const courseNum = courseNumRegex[0]

        if((await interaction.guild.channels.fetch()).map(v => v.name).some(v => v === courseNum)) {
          interaction.reply(`Course ${courseNum} already exists`)
          return
        }

        const cancel: MachiButton['execute'] = i => {
          acceptButton.button.setDisabled(true)
          row.update(acceptButton)
          row.refresh()

          i.reply(`Cancelled adding course ${courseNum}`)
        }
        const accept: MachiButton['execute'] = async i => {
          const reply = await i.deferReply({fetchReply: true})

          cancelButton.button.setDisabled(true)
          row.update(cancelButton)
          row.refresh()

          // console.log(_courseRole, taRole, trackerRole, aboveRole, aboveTARole, aboveTrackerRole, aboveChannel)

          const basicSep = aboveRole ?? await interaction.guild.roles.fetch("1032065627818565634")
          const taSep = aboveTARole ?? await interaction.guild.roles.fetch("1032072570398331014")
          const trackerSep = aboveTrackerRole ?? await interaction.guild.roles.fetch("1032063332489900143")

          const basicRole = _courseRole ?? await interaction.guild.roles.create({
            name: courseNum,
            position: basicSep.position
          })
        
          const taRole = _taRole ?? await interaction.guild.roles.create({
            name: courseNum + " TA",
            position: taSep.position
          })

          const trackerRole = _trackerRole ?? await interaction.guild.roles.create({
            name: courseNum + " Tracker",
            position: trackerSep.position
          })

          const basicPerms: PermissionResolvable[] = ["ViewChannel", "AddReactions", "UseExternalEmojis", "UseExternalStickers", "ReadMessageHistory", "SendMessages", "Connect", "Speak"]
          const basicPermsSansSending: PermissionResolvable[] = ["ViewChannel", "AddReactions", "UseExternalEmojis", "UseExternalStickers", "ReadMessageHistory", "Connect", "Speak"]

          const category = await interaction.guild.channels.create({
            name: courseNum,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: interaction.guild.roles.everyone,
                deny: basicPerms
              },
              {
                id: basicRole.id,
                allow: basicPerms
              },
              {
                id: taRole.id,
                allow: basicPerms
              },
              {
                id: trackerRole.id,
                allow: basicPerms
              }
            ], 
            position: (aboveChannel as CategoryChannel).position ?? 0
          })

          const announcements = await interaction.guild.channels.create({
            name: courseNum + " announcements",
            type: ChannelType.GuildAnnouncement,
            permissionOverwrites: [
              {
                id: interaction.guild.roles.everyone,
                deny: basicPerms
              },
              {
                id: basicRole.id,
                allow: basicPermsSansSending
              },
              {
                id: taRole.id,
                allow: basicPerms
              },
              {
                id: trackerRole.id,
                allow: [...basicPerms, "ManageMessages", "ManageThreads"]
              }
            ],
            parent: category
          })

          const reminders = await interaction.guild.channels.create({
            name: courseNum + " reminders",
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.roles.everyone,
                deny: basicPerms
              },
              {
                id: basicRole.id,
                allow: basicPermsSansSending
              },
              {
                id: taRole.id,
                allow: basicPerms
              },
              {
                id: trackerRole.id,
                allow: [...basicPerms, "ManageMessages", "ManageThreads"]
              }
            ],
            parent: category
          })

          const general = await interaction.guild.channels.create({
            name: courseNum + " general",
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.roles.everyone,
                deny: basicPerms
              },
              {
                id: basicRole.id,
                allow: basicPerms
              },
              {
                id: taRole.id,
                allow: basicPerms
              },
              {
                id: trackerRole.id,
                allow: [...basicPerms, "ManageMessages", "ManageThreads"]
              }
            ],
            parent: category
          })

          const voice = await interaction.guild.channels.create({
            name: courseNum + " collab VC",
            type: ChannelType.GuildVoice,
            permissionOverwrites: [
              {
                id: interaction.guild.roles.everyone,
                deny: basicPerms
              },
              {
                id: basicRole.id,
                allow: basicPerms
              },
              {
                id: taRole.id,
                allow: basicPerms
              },
              {
                id: trackerRole.id,
                allow: [...basicPerms, "ManageMessages", "ManageThreads"]
              }
            ],
            parent: category
          })

          i.editReply(`Added course ${courseNum}`)
        }

        const row = new MachiButtonRow(this, uuid, interaction)
        const acceptButton = new MachiButton(this, "Add Course", uuid, row, ButtonStyle.Danger, accept)
        const cancelButton = new MachiButton(this, "Cancel", uuid, row, ButtonStyle.Secondary, cancel)
        row.add(acceptButton, cancelButton)

        await interaction.reply({
          embeds: [{
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.avatarURL()
            },
            title: `Adding course ${courseNum}`,
            description: `Are you sure you want to add course ${courseNum}?`,
            color: (await interaction.user.fetch(true)).accentColor
          }],
          components: [row.create()] 
        });
      }, 
      remove: async (interaction) => {
        const courseChannel = interaction.options.getChannel("course_channel")
        interaction.reply(`Removing course ${courseChannel.name}`)
      }, 
      quarantine: async (interaction) => {
        const courseChannel = interaction.options.getChannel("course_channel")
        interaction.reply(`Quarantining course ${courseChannel.name}`)
      }
    }
  },
  upload: 0
}