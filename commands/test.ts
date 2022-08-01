import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } from "@discordjs/builders"
import { ButtonInteraction, ButtonStyle, CommandInteraction } from "discord.js"
import { Machi } from "../lib/machina"

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
    execute: async (interaction: CommandInteraction) => {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setLabel('Primary')
					.setStyle(ButtonStyle.Primary),
			);

		await interaction.reply({ content: 'Pong!', components: [row] });
    },
    button: {
        "testing": async (interaction: ButtonInteraction) => { 
            interaction.reply("testing! - 1 + 2 + 3")
        }
    },
    upload: 0 
}