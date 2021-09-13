import { CommandInteraction, MessageComponentInteraction } from "discord.js"

/** Returns a promise that waits for (ms) milliseconds before resolving */
export const sleep = async (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/** Checks if an interaction has already been replied. If so, return followup function; else, return reply function. Use this if you are going to be using a command within another command */
export const replyOrFollowup = (interaction: CommandInteraction | MessageComponentInteraction) => interaction?.replied ? 'followUp' : 'reply'
// I cant just return interaction.followUp or reply for some reason. Idk why tho