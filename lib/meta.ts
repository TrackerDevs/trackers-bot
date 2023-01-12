import { AnyComponentBuilder, ButtonBuilder } from "@discordjs/builders"
import { ActionRowBuilder, ButtonComponent, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, Component, ComponentType, Emoji, SelectMenuOptionBuilder } from "discord.js"
import { Bomb, Machi, Machina, MachiUtil } from "./machina"

export class MachiButton { 
  uuid: string
  label: string
  style: ButtonStyle
  command: Machi
  customId: string
  execute: (interaction?: ButtonInteraction, bot?: Machina, uuid?: string) => any
  button = new ButtonBuilder()
  bomb: Bomb
  row: MachiButtonRow

  constructor(command: Machi, label: string, uuid: string, row: MachiButtonRow, style: ButtonStyle, execute: (interaction: ButtonInteraction, bot: Machina, uuid: string) => Promise<void>) {
    this.uuid = uuid
    this.label = label
    this.style = style
    this.execute = execute
    this.customId = MachiUtil.customIdMaker(command, this.label, this.uuid)

    this.row = row
    
    this.command = MachiUtil.getThis(command)

    this.bomb = new Bomb(10 * 1000, this.delete.bind(this))
  }

  create() {
    this.button
      .setCustomId(this.customId)
      .setLabel(this.label)
      .setStyle(this.style)

    if((this.command.button ?? 0) == 0) 
      this.command.button = {}

    this.command.button[this.label] = async (interaction: ButtonInteraction, bot: Machina, uuid: string) => {
      await this.delete()
      await this.execute(interaction, bot, uuid)
    }

    return this.button
  }

  async delete() {
    this?.bomb?.defuse()

    this.button.setDisabled(true)
    this.row.update(this)
    this.row.refresh()

    if(this.command.button[this.label]) delete this.command.button[this.label]
  }
}

export class MachiButtonRow {
  uuid: string
  interaction: ChatInputCommandInteraction<CacheType>
  command: Machi
  row = new ActionRowBuilder<ButtonBuilder>()
  components: MachiButton[] = []

  constructor(command: Machi, uuid: string, interaction: ChatInputCommandInteraction<CacheType>) {
    this.uuid = uuid
    this.interaction = interaction
    this.command = MachiUtil.getThis(command)
  }

  add(...components: MachiButton[]) {
    this.components.push(...components)
  }

  update(...components: MachiButton[]) {
    let temp = {}
    this.components.forEach(c => temp[c.customId] = c)
    components.forEach(c => temp[c.customId] = c)
    this.components = Object.values(temp)
  }

  async refresh() {
    return this.interaction.editReply({components: [this.create()]}) 
  }

  create() {
    return this.row = new ActionRowBuilder<ButtonBuilder>().addComponents(this.components.map(c => c.create()))
  }
}