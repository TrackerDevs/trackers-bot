import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder } from "@discordjs/builders"
import { ButtonInteraction, ButtonStyle, CommandInteraction, Emoji, GuildEmoji, TextInputBuilder, TextInputStyle } from "discord.js"
import { Machi, MachiUtil } from "../lib/machina"
import nm from 'nodemailer'
import { MachiButton } from "../lib/meta"

/*
In order to create a command, you essentially replicate what is below.
export const <some name>: Machi = {
    data: new SlashCommandBuilder() and with your added options.
        - Note: if you don't add a name, the name will end up being the variable name
    execture: async (interaction: CommandInteraction) => {
        this is where you put all the command stuff
    }
    upload: -1 or 0 or 1
        - -1: This is so you can manually test your command without it being included the discord command list
        - 0: This command is added to the guilds given if it hasnt been added before
        - 1: This command is forcefully updated, useful if you need to update the commnad information of a command
            - Make sure to change it back to 0 once you have updated it however
}
*/

export const test: Machi = {
  data: (new SlashCommandBuilder()).setDescription("testing stuff and such"),
  execute: async (interaction, bot, uuid) => {
    // const TestButton = new MachiButton(this, "CS XXX", uuid, ButtonStyle.Primary, async (interaction, bot, uuid) => {
    //   await interaction.reply("testing! - 1 + 2 + 3")
    //   interaction[MachiUtil.replyOrFollowup(interaction)]("Testing")
    // })

    // let e = (await interaction.guild.emojis.fetch()).filter(_ => _.name === "bongchad").first()
    // let s = {
    //   name: "bongchad",
    //   id: e?.id,
    //   animated: true
    // }

    // const row = new ActionRowBuilder<ButtonBuilder>()
    //   .addComponents(
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //   );

    // const row2 = new ActionRowBuilder<ButtonBuilder>()
    //   .addComponents(
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //   );
    // const row3 = new ActionRowBuilder<ButtonBuilder>()
    //   .addComponents(
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //   );
    // const row4 = new ActionRowBuilder<ButtonBuilder>()
    //   .addComponents(
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //   );
    // const row5 = new ActionRowBuilder<ButtonBuilder>()
    //   .addComponents(
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //     TestButton.create().setEmoji(s),
    //   );

    // console.log(JSON.stringify(row.toJSON()))
    // console.log(JSON.stringify(row2.toJSON()))
    // console.log(JSON.stringify(row3.toJSON()))
    // console.log(JSON.stringify(row4.toJSON()))
    // console.log(JSON.stringify(row5.toJSON()))

    // await interaction.reply({ content: 'Poooong!', components: [row, row2, row3, row4, row5] });
    // await interaction.reply({ content: 'Poooong!'});
    const role = await interaction.guild.roles.cache.get("1085727487482408960")
    const member = await interaction.guild.members.fetch(interaction.user.id)
    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role)
      await interaction.reply("Removed Verified role!")
    } else {
      await member.roles.add(role)
      await interaction.reply("Added Verified role!")
    }
  },
  button: {
    "testing": async (interaction: ButtonInteraction, bot, uuid) => {
      // interaction.reply("testing! - 1 + 2 + 3")
      const modal = new ModalBuilder()
        .setCustomId(MachiUtil.customIdMaker(this, "submit", uuid))
        .setTitle('My Modal');

      // Add components to modal

      // Create the text input components
      const favoriteColorInput = new TextInputBuilder()
        .setCustomId('favoriteColorInput')
        // The label is the prompt the user sees for this input
        .setLabel("What's your favorite color?")
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short);

      const hobbiesInput = new TextInputBuilder()
        .setCustomId('hobbiesInput')
        .setLabel("What's some of your favorite hobbies?")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Paragraph);

      // An action row only holds one text input,
      // so you need one action row per text input.
      const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(favoriteColorInput);
      const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(hobbiesInput);

      // Add inputs to the modal
      modal.addComponents(firstActionRow, secondActionRow);

      // Show the modal to the user
      await interaction.showModal(modal);
    }
  },
  modalSubmit: {
    "submit": async (interaction, bot, uuid) => {
      console.log(interaction)
      interaction.reply("submit!")
    }
  },
  upload: 0
}