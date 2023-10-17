"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poll = void 0;
const builders_1 = require("@discordjs/builders");
const machina_1 = require("../lib/machina");
exports.poll = {
    data: (new builders_1.SlashCommandBuilder())
        .setDescription("Create A Poll!")
        .addStringOption(option => option.setName('title')
        .setDescription("Set the title of your poll").setRequired(true))
        .addStringOption(option => option.setName('options')
        .setDescription("Set your poll options, separated by a comma").setRequired(true))
        .addStringOption(option => option.setName('description')
        .setDescription('Add a description to your poll').setRequired(false)),
    execute: async (interaction, bot, uuid) => {
        const options = interaction.options.getString('options').split(', ').join(',').split(',');
        const row = new builders_1.ActionRowBuilder()
            .addComponents(new builders_1.SelectMenuBuilder()
            .setCustomId(machina_1.MachiUtil.customIdMaker(this, "select", uuid))
            .setPlaceholder('Nothing selected')
            .addOptions(options.map((_, i) => ({ label: _, value: _, description: `Option #${i + 1}` }))));
        await interaction.reply({
            embeds: [new builders_1.EmbedBuilder({
                    title: `Polls - ${interaction.options.getString('title')}`,
                    description: interaction.options.getString('description') || "A poll!",
                    footer: { text: `Poll started by ${interaction.user.username}` }
                })],
            components: [row]
        });
        setTimeout((async (i) => {
            await i.editReply({
                components: [],
                embeds: [new builders_1.EmbedBuilder({
                        title: `Poll - ${interaction.options.getString('title')} Concluded!`,
                        description: interaction.options.getString('description') || "A poll!",
                        fields: [{
                                name: "Results",
                                value: Object.entries([...machina_1.MachiUtil.getStorageInstance(this, bot, uuid).values()].reduce((prev, curr) => [prev, prev[curr] = (prev[curr] || 0) + 1][0], {})).map(_ => `${_[0]} recieved ${_[1]} ${_[1] == 1 ? "vote" : "votes"}`).join(", "),
                                inline: true
                            }],
                        footer: { text: `Poll started by ${interaction.user.username}` }
                    })]
            });
            machina_1.MachiUtil.deleteStorage(this, bot);
        }).bind(null, interaction), 1000 * 30);
    },
    selectMenu: {
        select: async (interaction, bot, uuid) => {
            machina_1.MachiUtil.getStorageInstance(this, bot, uuid).set(interaction.user.username, interaction.values.join(", "));
            interaction[machina_1.MachiUtil.replyOrFollowup(interaction)]({
                content: `Received: ${interaction.values.join('\n')}`,
                ephemeral: true
            });
        }
    },
    upload: 0
};
/**
 * TODO:
 * Possibly create a handler for extra interactions, e.g. interaction with select menu
 * Add interactions to Machi, so when command.interactionName is called, it calls this command's interactions .interactionName(interaction, bot)
 * This makes it so the command doesnt have to stay alive longer than neccessary, and puts the command handling on to the main thing, also no need to remove event listener.
 */ 
