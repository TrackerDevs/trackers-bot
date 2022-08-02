import { SlashCommandBuilder} from "@discordjs/builders"
import { Machi, MachiUtil } from "../lib/machina"
import crypto from "crypto"
import { UserModel } from "../lib/mongo"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { HEX, sleep } from "../lib/util"

const waitTime = 1000 * 60 * 5
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
      ephemeral: true
    })
    return true 
  }

  return false
}

export const verify: Machi = {
    data: (new SlashCommandBuilder()).setDescription("Verify your discord account with your UIC NetID!")
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
    execute: async (interaction, bot, uuid) => {
      if(!bot.mailer) {
        interaction.reply({content: 'Error: Email service not in use, check back later!', ephemeral: true})
        return
      }

      if(await alreadyVerified(interaction)) 
        return

      const netid = interaction.options.getString("netid")
      const rand = crypto.randomBytes(10).toString('hex')

      MachiUtil.addStorageItem(this, bot, "codes", interaction.user.id, rand, waitTime)

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

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(MachiUtil.customIdMaker(this, "openModal", interaction.user.id))
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success),
        );

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

      MachiUtil.addStorageItem(this, bot, "interactions", interaction.user.id, {interaction, netid}, waitTime)

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
        components: [] 
      })
    },
    subCommands: {
        getcode: async (interaction, bot) => {
            if(!bot.mailer) {
              interaction.reply({content: 'Error: Email service not in use, check back later!', ephemeral: true})
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
                  description: "Your account is now verified! You can now use commands limited for UIC studnets only!",
                  color: HEX.GREEN
                }], 
                ephemeral: true
              })

              MachiUtil.getStorageInstance(this, bot, "codes").delete(netid)
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
      "openModal": async (interaction, bot, uuid) => {
            const modal = new ModalBuilder()
                .setCustomId(MachiUtil.customIdMaker(this, "submit", uuid))
                .setTitle('Verification!');

            modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId('code')
                .setLabel("Enter Verification Code Here:")
                .setStyle(TextInputStyle.Short)
            ))

            await interaction.showModal(modal)
      }
    },
    modalSubmit: {
      "submit": async (interaction, bot, uuid) => {
        const code = interaction.fields.getTextInputValue("code")
        const realCode = MachiUtil.getStorageInstance(this, bot, "codes").get(uuid)
        const netid = MachiUtil.getStorageInstance(this, bot, "interactions").get(uuid).netid as string

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
              description: "Your account is now verified! You can now use commands limited for UIC studnets only!",
              color: HEX.GREEN
            }], 
            ephemeral: true
          }).then(() => (MachiUtil.getStorageInstance(this, bot, "interactions").get(uuid).interaction as ChatInputCommandInteraction<CacheType>).editReply({components: []}))

          MachiUtil.getStorageInstance(this, bot, "codes").delete(uuid)
        } else {
          if(realCode == undefined) 
            interaction.reply({
              embeds: [{
                author: {
                  name: interaction.user.username,
                  icon_url: interaction.user.avatarURL()
                },
                title: "Code Invalid!",
                description: "You waited too long! Please retry",
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