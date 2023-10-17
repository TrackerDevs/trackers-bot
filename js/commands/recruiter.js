"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiter = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const machina_1 = require("../lib/machina");
const luxon_1 = require("luxon");
const util_1 = require("../lib/util");
const mongo_1 = require("../lib/mongo");
const v10_1 = require("discord-api-types/v10");
const CATEGORY_NAME = "Recruiter";
// Embed Partials 
const partial = {
    author: (interaction) => ({
        name: interaction.user.username,
        icon_url: interaction.user.avatarURL()
    })
};
// Embed Message STates that need to be reused
const states = {
    initial: (interaction, uuid, that, max, interval, breakTime, totalTime) => ({ embeds: [new discord_js_1.EmbedBuilder({
                author: partial.author(interaction),
                title: "Continue?",
                description: `The current configurations are listed below. Click the buttons below to continue or cancel.`,
                fields: [
                    { name: "Max People", value: max + "", inline: true },
                    { name: "Interval Time", value: interval + " minutes", inline: true },
                    { name: "Break Time", value: breakTime + " minutes", inline: true },
                    { name: "Total Time", value: totalTime, inline: true },
                ]
            })], components: [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel("Cancel").setStyle(discord_js_1.ButtonStyle.Danger).setCustomId(machina_1.MachiUtil.customIdMaker(that, "cancel", uuid)), new discord_js_1.ButtonBuilder().setLabel("Continue").setStyle(discord_js_1.ButtonStyle.Primary).setCustomId(machina_1.MachiUtil.customIdMaker(that, "continue", uuid)), new discord_js_1.ButtonBuilder().setLabel("Info").setStyle(discord_js_1.ButtonStyle.Secondary).setCustomId(machina_1.MachiUtil.customIdMaker(that, "info", uuid)))] }),
    cancel: (interaction) => ({ embeds: [new discord_js_1.EmbedBuilder({
                author: partial.author(interaction),
                title: "Queue Canclled",
                color: util_1.HEX.RED
            })], components: [] })
};
exports.recruiter = {
    data: (new builders_1.SlashCommandBuilder())
        .setDescription("Commands for recruiters!")
        .addSubcommand(sC => sC
        .setName("createqueue")
        .setDescription("Create a queue for students to join")
        .addNumberOption(nOp => nOp
        .setName("max")
        .setDescription("Set the max number of students in the queue")
        .setRequired(true))
        .addNumberOption(nOp => nOp
        .setName("interval")
        .setDescription("Set the duration of each interval in minutes")
        .setRequired(true))
        .addNumberOption(nOp => nOp
        .setName("break")
        .setDescription("Set the duration of breaktime between meets in minutes")
        .setRequired(true))),
    execute: async (interaction) => {
        interaction.reply("this is a fallback, and should theoretically never rrrrrun");
    },
    subCommands: {
        createqueue: (interaction, bot, uuid) => {
            const max = interaction.options.getNumber("max");
            const interval = interaction.options.getNumber("interval");
            const breakTime = interaction.options.getNumber("break");
            const totalTime = (_ => `${parseInt(_[0]) > 0 ? _[0] + " hours" : ''} ${_[1]} minutes`)(luxon_1.Duration.fromObject({ minutes: max * interval + (max - 1) * breakTime }).toFormat('h:mm').split(':'));
            machina_1.MachiUtil.addStorageItem(this, bot, uuid, "data", { max, interval, breakTime, totalTime, interaction }, 1000 * 60 * 60 * 24);
            machina_1.MachiUtil.addStorageItem(this, bot, uuid, "authorInteraction", interaction, 1000 * 60 * 60 * 24);
            interaction.reply({
                ephemeral: true,
                content: 'Queue Created! Please see your direct messages for more information.',
            });
            interaction.user.send(states.initial(interaction, uuid, this, max, interval, breakTime, totalTime));
        }
    },
    button: {
        cancel: async (interaction, bot, uuid) => {
            const reply = await interaction.deferUpdate({ fetchReply: true });
            const authorInteraction = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "authorInteraction");
            await authorInteraction.guild.channels.fetch();
            authorInteraction.guild.channels.cache.find(c => c.type === v10_1.ChannelType.GuildVoice && c.name === `${authorInteraction.user.username}'s Channel`).delete();
            reply.edit(states.cancel(interaction));
            machina_1.MachiUtil.deleteStorageInstance(this, bot, uuid);
        },
        info: async (interaction, bot, uuid) => {
            const reply = await interaction.deferUpdate({ fetchReply: true });
            reply.edit({ embeds: [new discord_js_1.EmbedBuilder({
                        author: partial.author(interaction),
                        title: "Information",
                        description: "Once hitting create, a message will be sent out in this channel. \nIt will allow any student to join the queue. \nOnce the queue is full, no new students will be able to join. \nStudents are users who are verified students at UIC.",
                        color: (await interaction.user.fetch(true)).accentColor
                    })], components: [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel("Cancel").setStyle(discord_js_1.ButtonStyle.Danger).setCustomId(machina_1.MachiUtil.customIdMaker(this, "cancel", uuid)), new discord_js_1.ButtonBuilder().setLabel("Continue").setStyle(discord_js_1.ButtonStyle.Primary).setCustomId(machina_1.MachiUtil.customIdMaker(this, "continue", uuid)), new discord_js_1.ButtonBuilder().setLabel("Back").setStyle(discord_js_1.ButtonStyle.Secondary).setCustomId(machina_1.MachiUtil.customIdMaker(this, "initial", uuid)))] });
        },
        initial: async (interaction, bot, uuid) => {
            const reply = await interaction.deferUpdate({ fetchReply: true });
            const { max, interval, breakTime, totalTime } = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "data");
            reply.edit(states.initial(interaction, uuid, this, max, interval, breakTime, totalTime));
        },
        continue: async (interaction, bot, uuid) => {
            const reply = await interaction.deferUpdate({ fetchReply: true });
            const authorInteraction = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "authorInteraction");
            const { max, interval, breakTime, totalTime } = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "data");
            reply.edit({ embeds: [new discord_js_1.EmbedBuilder({
                        author: partial.author(interaction),
                        title: "Creating Queue...",
                        color: util_1.HEX.BLURPLE
                    })], components: [] });
            await authorInteraction.guild.channels.fetch();
            let category = authorInteraction.guild.channels.cache.find(c => c.type === v10_1.ChannelType.GuildCategory && c.name === CATEGORY_NAME);
            if (!category)
                category = await authorInteraction.guild.channels.create({ name: CATEGORY_NAME, type: v10_1.ChannelType.GuildCategory });
            let waitingRoom = authorInteraction.guild.channels.cache.find(c => c.type === v10_1.ChannelType.GuildVoice && c.name === "Waiting Room");
            if (!waitingRoom)
                waitingRoom = await authorInteraction.guild.channels.create({ name: "Waiting Room", type: v10_1.ChannelType.GuildVoice, parent: category.id, permissionOverwrites: [{ id: authorInteraction.guild.id, deny: [v10_1.PermissionFlagsBits.Speak, v10_1.PermissionFlagsBits.SendMessages] }] });
            let channel = authorInteraction.guild.channels.cache.find(c => c.type === v10_1.ChannelType.GuildVoice && c.name === `${interaction.user.username}'s Channel`);
            if (!channel)
                channel = await authorInteraction.guild.channels.create({ name: `${interaction.user.username}'s Channel`, type: v10_1.ChannelType.GuildVoice, parent: category.id, permissionOverwrites: [{ id: authorInteraction.guild.id, deny: [v10_1.PermissionFlagsBits.Speak, v10_1.PermissionFlagsBits.SendMessages, v10_1.PermissionFlagsBits.Connect, v10_1.PermissionFlagsBits.ViewChannel] }, { id: interaction.user.id, allow: [v10_1.PermissionFlagsBits.Speak, v10_1.PermissionFlagsBits.SendMessages, v10_1.PermissionFlagsBits.Connect, v10_1.PermissionFlagsBits.ViewChannel] }] });
            machina_1.MachiUtil.addStorageItem(this, bot, uuid, "channel", channel, 1000 * 60 * 60 * 24);
            await reply.edit({
                embeds: [new discord_js_1.EmbedBuilder({
                        author: partial.author(interaction),
                        title: "Manage Queue",
                        description: "Below are the options for managing the queue. \nYou can bring in the next person or close the queue. ",
                        color: util_1.HEX.BLURPLE
                    })],
                components: [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel("Stop").setStyle(discord_js_1.ButtonStyle.Danger).setCustomId(machina_1.MachiUtil.customIdMaker(this, "cancel", uuid)), new discord_js_1.ButtonBuilder().setLabel("Remove Current Person").setStyle(discord_js_1.ButtonStyle.Danger).setCustomId(machina_1.MachiUtil.customIdMaker(this, "removecurrent", uuid)), new discord_js_1.ButtonBuilder().setLabel("Next Person").setStyle(discord_js_1.ButtonStyle.Primary).setCustomId(machina_1.MachiUtil.customIdMaker(this, "next", uuid)), new discord_js_1.ButtonBuilder().setLabel("Join Voice").setStyle(discord_js_1.ButtonStyle.Link).setURL((await channel.createInvite()).url))]
            });
            authorInteraction.channel.send({ embeds: [new discord_js_1.EmbedBuilder({
                        author: partial.author(interaction),
                        title: "Queue for " + interaction.user.username,
                        description: `This is the queue for ${interaction.user.username}. \nYou can join the queue by clicking the button below.`,
                        fields: [
                            { name: "Time Per Slot", value: interval, inline: true },
                            { name: "Break Time Per Slot", value: breakTime, inline: true },
                            { name: "Slots", value: '0/' + max, inline: true },
                        ]
                    })], components: [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel("Join Queue").setStyle(discord_js_1.ButtonStyle.Primary).setCustomId(machina_1.MachiUtil.customIdMaker(this, "join", uuid)))] }).then(msg => machina_1.MachiUtil.addStorageItem(this, bot, uuid, "publicMessage", msg, 1000 * 60 * 60 * 24));
            machina_1.MachiUtil.addStorageItem(this, bot, uuid, "queue", { users: [], count: 0, max }, 1000 * 60 * 60 * 24);
        },
        join: async (interaction, bot, uuid) => {
            if (!machina_1.MachiUtil.storageInstanceExists(this, bot, uuid))
                return;
            const reply = await interaction.deferUpdate({ fetchReply: true });
            const { max, interval, breakTime, totalTime } = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "data");
            const queue = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "queue");
            const user = await mongo_1.UserModel.findOne({ id: interaction.user.id });
            if (!user || !user.verified) {
                interaction.followUp({ content: "You must be a verified student at UIC to join the queue! To verify yourself, please use the /verify command.", ephemeral: true });
                return;
            }
            if (queue.count >= max) {
                interaction.followUp({ content: "The queue is full. Please try again later.", ephemeral: true });
                return;
            }
            if (queue.users.find(u => u.user.id === interaction.user.id)) {
                interaction.followUp({ content: "You are already in the queue.", ephemeral: true });
                return;
            }
            let position = queue.count;
            queue.count++;
            updateAuthorMessage(interaction, bot, uuid);
            let res = await interaction.user.send({ embeds: [new discord_js_1.EmbedBuilder({
                        author: partial.author(interaction),
                        title: 'You\'re in!',
                        description: 'You are currently in the queue. Please wait for your turn. \nYou can leave the queue by clicking the button below.\n When it is your turn, you will be moved to the voice channel.',
                        fields: [
                            { name: "Position", value: position + '', inline: true },
                            { name: "Estimated Time", value: luxon_1.DateTime.now().setZone('America/Chicago').plus({ minutes: position * interval + position * breakTime }).toFormat('hh:mm a'), inline: true },
                        ]
                    })], components: [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel("Leave Queue").setStyle(discord_js_1.ButtonStyle.Primary).setCustomId(machina_1.MachiUtil.customIdMaker(this, "leave", uuid)))] });
            queue.users.push({ user: interaction.user, interaction, message: res });
        },
        leave: async (interaction, bot, uuid) => {
            if (!machina_1.MachiUtil.storageInstanceExists(this, bot, uuid))
                return;
            const reply = await interaction.deferUpdate({ fetchReply: true });
            const queue = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "queue");
            const publicMessage = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "publicMessage");
            if (!queue.users.find(u => u.user.id === interaction.user.id)) {
                interaction.followUp({ content: "You are not in the queue.", ephemeral: true });
                return;
            }
            queue.users = queue.users.filter(u => u.user.id !== interaction.user.id);
            queue.count--;
            updateAuthorMessage(interaction, bot, uuid);
            reply.edit({ embeds: [new discord_js_1.EmbedBuilder({
                        author: reply.embeds[0].author,
                        title: 'You\'re out!',
                        description: 'You are no longer in the queue. \nYou can rejoin the queue if there is space left.',
                    })], components: [] });
        },
        next: async (interaction, bot, uuid) => {
            if (!machina_1.MachiUtil.storageInstanceExists(this, bot, uuid))
                return;
            const reply = await interaction.deferUpdate({ fetchReply: true });
            const queue = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "queue");
            const channel = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "channel");
            const publicMessage = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "publicMessage");
            const authorInteraction = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "authorInteraction");
            if (queue.count === 0) {
                interaction.followUp({ content: "The queue is empty.", ephemeral: true });
                return;
            }
            const user = queue.users.shift();
            // queue.count--
            updateAuthorMessage(interaction, bot, uuid);
            user.member = await authorInteraction.guild.members.cache.get(user.user.id);
            if (!user.member) {
                interaction.followUp({ content: "Could not find user in the server.", ephemeral: true });
                return;
            }
            // if(!user.member.voice.channel) {
            //   interaction.followUp({content: "User couldn't be moved in.", ephemeral: true})
            //   return
            // }
            user.member.voice.setChannel(channel);
            user.member.voice.setDeaf(false);
            user.member.voice.setMute(false);
            channel.permissionOverwrites.create(user.member, { SendMessages: true });
            machina_1.MachiUtil.addStorageItem(this, bot, uuid, "currentUser", user, 1000 * 60 * 60 * 24);
        },
        removecurrent: async (interaction, bot, uuid) => {
            if (!machina_1.MachiUtil.storageInstanceExists(this, bot, uuid))
                return;
            const reply = await interaction.deferUpdate({ fetchReply: true });
            const currentUser = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "currentUser");
            const authorInteraction = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "authorInteraction");
            const channel = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "channel");
            if (!currentUser) {
                interaction.followUp({ content: "There is no current user.", ephemeral: true });
                return;
            }
            const author = authorInteraction.user;
            let a = authorInteraction.guild.channels.cache.find(c => c.type === v10_1.ChannelType.GuildVoice && c.name === "Waiting Room");
            if (a.isVoiceBased())
                currentUser.member.voice.setChannel(a);
            else
                currentUser.member.voice.setChannel(null);
            // channel.messages.
            // channel.messages.fetch().then(messages =>
            //   messages.forEach(async message => {
            //     message = await message.fetch(true)
            //     console.log(message)
            // //     // message.
            // //     let toSend = {embeds: [new EmbedBuilder({
            // //       author: {
            // //           name: message.author.username,
            // //           icon_url: message.author.avatarURL()
            // //         },
            // //         title: message.content
            // //       })]}
            // //       currentUser.user.send(toSend)
            // //       author.send(toSend)
            // //       // message.delete()
            //   }
            // ))
        }
    },
    upload: 0
};
const updateAuthorMessage = async (interaction, bot, uuid) => {
    var _a, _b, _c;
    const { max, interval, breakTime, totalTime } = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "data");
    const queue = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "queue");
    const publicMessage = machina_1.MachiUtil.getStorageItem(this, bot, uuid, "publicMessage");
    let components = queue.count == max ? [] : [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel("Join Queue").setStyle(discord_js_1.ButtonStyle.Primary).setCustomId(machina_1.MachiUtil.customIdMaker(this, "join", uuid)))];
    let reply = await publicMessage.fetch(true);
    await reply.edit({ embeds: [new discord_js_1.EmbedBuilder({
                author: (_a = reply.embeds[0].author) !== null && _a !== void 0 ? _a : { name: "N/A" },
                title: (_b = reply.embeds[0].title) !== null && _b !== void 0 ? _b : 'N/A',
                description: (_c = reply.embeds[0].description) !== null && _c !== void 0 ? _c : 'N/A',
                fields: [
                    { name: "Time Per Slot", value: interval !== null && interval !== void 0 ? interval : 0, inline: true },
                    { name: "Break Time Per Slot", value: breakTime !== null && breakTime !== void 0 ? breakTime : 0, inline: true },
                    { name: "Slots", value: queue.count + '/' + max, inline: true },
                ]
            })], components });
    queue.users.forEach(async (u, i) => {
        var _a, _b, _c;
        let _reply = await u.message.fetch(true);
        u.message.edit({ embeds: [new discord_js_1.EmbedBuilder({
                    author: (_a = _reply.embeds[0].author) !== null && _a !== void 0 ? _a : { name: "N/A" },
                    title: (_b = _reply.embeds[0].title) !== null && _b !== void 0 ? _b : 'N/A',
                    description: (_c = _reply.embeds[0].description) !== null && _c !== void 0 ? _c : 'N/A',
                    fields: [
                        { name: "Position", value: i + '', inline: true },
                        { name: "Estimated Time", value: luxon_1.DateTime.now().setZone('America/Chicago').plus({ minutes: i * interval + i * breakTime }).toFormat('hh:mm a'), inline: true },
                    ]
                })], components: _reply.components });
    });
};
