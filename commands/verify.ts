import { SlashCommandBuilder} from "@discordjs/builders"
import { Machi, MachiUtil } from "../lib/machina"
import crypto from "crypto"
import { UserModel } from "../lib/mongo"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, GuildMemberRoleManager, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { HEX, sleep } from "../lib/util"

const waitTime = 1000 * 60 * 5 // How much time to wait before a code expires 

const assignRole = async (interaction: Interaction) => {
  const role = interaction.guild.roles.cache.find(role => role.name === "Tracker" || role.name === "Trackers")
  if(role)
    await (interaction.member.roles as GuildMemberRoleManager).add(role)
}

/**
 * Checks the database to see if the user already is verified, and notifies them as such. 
 * @param interaction The interaction object
 * @returns bool Whether or not the user is verified
 */
const alreadyVerified = async (interaction: ChatInputCommandInteraction) => {
  const user = await UserModel.findOne({id: interaction.user.id})

  if(user && user.verified) {
    interaction.reply({
      embeds: [{
        author: {
          name: interaction.user.username,
          icon_url: interaction.user.avatarURL()
        },
        title: "Already Verified!",
        description: "You have verified yourself previously, no need to do it again!",
        color: (await interaction.user.fetch(true)).accentColor
      }], 
      ephemeral: false
    })

    assignRole(interaction)
    return true 
  }

  return false
}

/**
 * Checks the database to see if the NetID is already associated with another user. 
 * @param netid The netid of the user
 * @returns bool Whether or not there is another user with the same NetID
 */
const otherPerson = async (interaction: ChatInputCommandInteraction) => {
  let netid = interaction.options.getString("netid")
  const user = await UserModel.findOne({netid})
  
  if(user && user.verified) {
    await interaction.reply({
      embeds: [{
        author: {
          name: interaction.user.username,
          icon_url: interaction.user.avatarURL()
        },
        title: `${netid} is in use!`,
        description: "You can't use someone else's NetID for verification! 🤔",
        color: HEX.RED
      }], 
      ephemeral: false
    })

    return true
  }
  return false
}

export const verify: Machi = {
    data: (new SlashCommandBuilder())
    .setDescription("Verify your discord account with your UIC NetID!")
    .addStringOption(sOp => sOp.setName("netid").setDescription("Your UIC NetID").setRequired(true))
    // .addSubcommand(
    //   c => c
    //     .setName("getcode")
    //     .setDescription("Get a code to verify your account at NetID@uic.edu")
    //     .addStringOption(sOp => sOp
    //       .setName("netid")
    //       .setDescription("Your NetID e.g. jappl5")
    //       .setRequired(true)  
    //     )
    // ).addSubcommand(
    //   c => c
    //     .setName("usecode")
    //     .setDescription("Use a code to verify your account")
    //     .addStringOption(sOp => sOp
    //       .setName("netid")
    //       .setDescription("Your NetID e.g. jappl5")
    //       .setRequired(true)  
    //     )
    //     .addStringOption(nOp => nOp
    //       .setName("code")
    //       .setDescription("The code you received")
    //       .setRequired(true)
    //     )
    // )
    ,
    execute: async (interaction, bot) => {
      if(!bot.mailer) { // Check to see if the mailer is in service
        interaction.reply({content: 'Error: Email service not in use, check back later!', ephemeral: false})
        return
      }

      // Check to see if the user is already verified
      // Check to see if there is another user with the same netid
      if(await alreadyVerified(interaction) || await otherPerson(interaction)) 
        return

      const netid = interaction.options.getString("netid") // Get the netid from the options
      const rand = crypto.randomBytes(3).toString('hex') // Generate a random code    

      MachiUtil.addStorageItem(this, bot, "codes", interaction.user.id, rand, waitTime) // Add the code to the storage for later use

      // Send a message to the user saying to check their email 
      await interaction.reply({
        embeds: [{
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.avatarURL()
          },
          title: `Sending code to ${netid}@uic.edu...`,
          description: `Your code is being sent to ${netid}@uic.edu! Please wait patiently while we send it!`,
          color: (await interaction.user.fetch(true)).accentColor
        }], 
        ephemeral: true
      })
      
      // Attempt to send the email
      try {
        await bot.mailer.sendMail({
            from: '"Project Bot" <projectbotuic@gmail.com>',
            to: netid + '@uic.edu',
            subject: 'Discord & NetID verification!',
            text: '🤖 here is your code: ' + rand 
        })
      } catch(e) {
        interaction.editReply({content: `Error: there was an issue sending the code to ${netid}@uic.edu! Please notify Hamziniii`})
        return
      }

      // Create the button to open modal
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(MachiUtil.customIdMaker(this, "openModal", interaction.user.id))
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success),
        );

      // Edit reply to show button and ask user to click button
      await interaction.editReply({
        embeds: [{
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.avatarURL()
          },
          title: `Code sent to ${netid}@uic.edu!`,
          description: `Your code is sent to ${netid}@uic.edu!\nYou have ${waitTime / 60 / 1000} minutes to click the button below and paste the code!\n Make sure to remove any spaces!`,
          color: (await interaction.user.fetch(true)).accentColor
        }], 
        components: [row]
      })

      // Save the interaction for later use 
      MachiUtil.addStorageItem(this, bot, "interactions", interaction.user.id, {interaction, netid}, waitTime)

      // Wait for waitTime amount of time to pass
      await sleep(waitTime)

      // Say that the code has expried and remove the button
      await interaction.editReply({
        embeds: [{
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.avatarURL()
          },
          title: `Code Expired!`,
          description: `The time has elapsed!`,
          color: (await interaction.user.fetch(true)).accentColor
        }],
        components: [] 
      })
    },
    subCommands: { // Below are the subcommands for the verify command, which is the verification v1 of the command
        getcode: async (interaction, bot) => {
            if(!bot.mailer) {
              interaction.reply({content: 'Error: Email service not in use, check back later!', ephemeral: false})
              return
            }

            if(await alreadyVerified(interaction)) 
              return

            const netid = interaction.options.getString("netid")
            const rand = crypto.randomBytes(10).toString('hex')

            MachiUtil.addStorageItem(this, bot, "codes", netid, rand, waitTime)

            await interaction.reply({
              embeds: [{
                author: {
                  name: interaction.user.username,
                  icon_url: interaction.user.avatarURL()
                },
                title: `Sending code to ${netid}@uic.edu...`,
                description: `Your code is being sent to ${netid}@uic.edu! Please wait patiently while we send it!`,
                color: (await interaction.user.fetch(true)).accentColor
              }], 
              ephemeral: true
            })
            
            try {
              await bot.mailer.sendMail({
                  from: '"Project Bot" <projectbotuic@gmail.com>',
                  to: netid + '@uic.edu',
                  subject: 'Discord & NetID verification!',
                  text: '🤖 here is your code: ' + rand 
              })
            } catch(e) {
              interaction.editReply({content: `Error: there was an issue sending the code to ${netid}@uic.edu! Please notify Hamziniii#4014`})
              return
            }

            await interaction.editReply({
              embeds: [{
                author: {
                  name: interaction.user.username,
                  icon_url: interaction.user.avatarURL()
                },
                title: `Code sent to ${netid}@uic.edu!`,
                description: `Your code is sent to ${netid}@uic.edu!\nYou have ${waitTime / 60 / 1000} minutes to run \`/verify usecode <netid> <code>\`!\n Make sure to remove any spaces from the code!`,
                color: (await interaction.user.fetch(true)).accentColor
              }], 
            })
            
            await sleep(waitTime)

            await interaction.editReply({
              embeds: [{
                author: {
                  name: interaction.user.username,
                  icon_url: interaction.user.avatarURL()
                },
                title: `Code Expired!`,
                description: `The time has elapsed!`,
                color: (await interaction.user.fetch(true)).accentColor
              }], 
            })
          }, 
        usecode: async (interaction, bot) => {
          if(await alreadyVerified(interaction)) 
            return

          const netid = interaction.options.getString("netid")
          const code = interaction.options.getString("code")
          const realCode = MachiUtil.getStorageInstance(this, bot, "codes").get(netid)

          if(realCode == code.trim()) {
              await UserModel.findOneAndUpdate(
                {id: interaction.user.id}, 
                {
                  netid: netid,
                  verified: true
                }, 
                {upsert: true}
              )

              interaction.reply({
                embeds: [{
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL()
                  },
                  title: "Account Verified!",
                  description: "Your account is now verified! You can now use commands limited for UIC students only!",
                  color: HEX.GREEN
                }], 
                ephemeral: true
              })

              MachiUtil.getStorageInstance(this, bot, "codes").delete(netid)
              assignRole(interaction)
          } else
            if(realCode == undefined) 
              interaction.reply({
                embeds: [{
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL()
                  },
                  title: "Code Invalid!",
                  description: "Either you waited too long or you didn't run \`/verify getcode <netid>!\`. Also check you entered the correct NetID!",
                  color: HEX.RED
                }], 
                ephemeral: true
              })
            else 
              interaction.reply({
                embeds: [{
                  author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL()
                  },
                  title: "Code Invalid!",
                  description: "You did not enter the correct code! Check if you copied it correctly!",
                  color: HEX.RED
                }], 
                ephemeral: true,
              })
        }
    },
    button: {
      // This is what happens when the user clicks the button 
      "openModal": async (interaction, bot, uuid) => {
        // Create a new modal 
        const modal = new ModalBuilder()
            .setCustomId(MachiUtil.customIdMaker(this, "submit", uuid))
            .setTitle('Verification!');

        // Add to the modal a field for the netid
        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('code')
            .setLabel("Enter Verification Code Here:")
            .setStyle(TextInputStyle.Short)
        ))

        // Show the modal 
        await interaction.showModal(modal)
      }
    },
    modalSubmit: {
      // What happens when the user submits the modal 
      "submit": async (interaction, bot, uuid) => {
        // Extract info from the interaction 
        const code = interaction.fields.getTextInputValue("code") // Get the code from the modal
        const realCode = MachiUtil.getStorageInstance(this, bot, "codes").get(uuid) // Get the real code from the storage
        const netid = MachiUtil.getStorageInstance(this, bot, "interactions").get(uuid).netid as string // Get the netid from the storage

        if(realCode == code.trim()) { // If the code is correct
          // Add/Update the user in the database
          await UserModel.findOneAndUpdate(
            {id: interaction.user.id}, 
            {
              netid: netid,
              verified: true
            }, 
            {upsert: true}
          )
          
          // Respond with success message 
          interaction.reply({
            embeds: [{
              author: {
                name: interaction.user.username,
                icon_url: interaction.user.avatarURL()
              },
              title: "Account Verified!",
              description: "Your account is now verified! You can now use commands limited for UIC studnets only!",
              color: HEX.GREEN
            }], 
            ephemeral: true
          })
            .then(
              // Remove button to open modal 
              () => (MachiUtil.getStorageInstance(this, bot, "interactions").get(uuid).interaction as ChatInputCommandInteraction<CacheType>).editReply({components: []})
            )
          
          // Delete the UUID from storage 
          MachiUtil.getStorageInstance(this, bot, "codes").delete(uuid)
          assignRole(interaction)
        } else {
          if(realCode == undefined) // If the code has expired
            interaction.reply({
              embeds: [{
                author: {
                  name: interaction.user.username,
                  icon_url: interaction.user.avatarURL()
                },
                title: "Code Expired!",
                description: "You waited too long! Please retry",
                color: HEX.RED
              }], 
              ephemeral: true
            })
          else // If the inputted code was wrong 
            interaction.reply({
              embeds: [{
                author: {
                  name: interaction.user.username,
                  icon_url: interaction.user.avatarURL()
                },
                title: "Code Invalid!",
                description: "You did not enter the correct code! Check if you copied it correctly, and hit the verify button again!",
                color: HEX.RED
              }], 
              ephemeral: true
            })
        }
      }
    },
    upload: 0
}