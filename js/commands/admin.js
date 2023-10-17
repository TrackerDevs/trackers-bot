"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const meta_1 = require("../lib/meta");
const mongo_1 = require("../lib/mongo");
const util_1 = require("../lib/util");
const schedule_1 = require("./schedule");
exports.admin = {
    data: (new builders_1.SlashCommandBuilder())
        .setDescription("Administrator commands")
        .addSubcommandGroup(group => group
        .setName("course")
        .setDescription("Course commands")
        .addSubcommand(command => command
        .setName("add")
        .setDescription("Add a course cluster (channels, roles, etc.)")
        .addStringOption(sOp => sOp.setName("course_num").setDescription("The course number").setRequired(true))
        .addChannelOption(cOp => cOp.setName("course_channel").setDescription("Positions the new category under the given one").setRequired(true).addChannelTypes(discord_js_1.ChannelType.GuildCategory))
        .addRoleOption(rOp => rOp.setName("ab_course_role").setDescription("Positions the new course role under the given one").setRequired(false))
        .addRoleOption(rOp => rOp.setName("ab_ta_role").setDescription("Positions the new ta role under the given one").setRequired(false))
        .addRoleOption(rOp => rOp.setName("ab_tracker_role").setDescription("Positions the new tracker role under the given one").setRequired(false))
        .addRoleOption(rOp => rOp.setName("course_role").setDescription("Role for the class if one has been made").setRequired(false))
        .addRoleOption(rOp => rOp.setName("ta_role").setDescription("Role for the TAs if one has been made").setRequired(false))
        .addRoleOption(rOp => rOp.setName("tracker_role").setDescription("Role for the trackers if one has been made").setRequired(false)))
        .addSubcommand(command => command
        .setName("remove")
        .setDescription("REMOVES a course cluster (be careful!!!)")
        .addChannelOption(sOp => sOp
        .setName("course_channel").
        setDescription("The course category that you would like to remove (!!!)")
        .setRequired(true)
        .addChannelTypes(discord_js_1.ChannelType.GuildCategory)))
        .addSubcommand(command => command
        .setName("quarantine")
        .setDescription("Remove all users from this course cluster (be careful!)")
        .addChannelOption(sOp => sOp
        .setName("course_channel").
        setDescription("The course category that you would like to quarantine (!)")
        .setRequired(true)
        .addChannelTypes(discord_js_1.ChannelType.GuildCategory))))
        .addSubcommandGroup(group => group
        .setName("user")
        .setDescription("User commands")
        .addSubcommand(command => command
        .setName("view")
        .setDescription("View a user's profile")
        .addUserOption(uOp => uOp.setName("user").setDescription("The user you want to view the profile of").setRequired(true))))
        .setDefaultMemberPermissions(8),
    execute: async (interaction) => {
        interaction.reply("this is a fallback, and should theoretically never rrrrrun");
    },
    subCommandGroups: {
        course: {
            add: async (interaction, bot, uuid) => {
                const input = interaction.options.getString("course_num");
                const _courseRole = interaction.options.getRole("course_role");
                const _taRole = interaction.options.getRole("ta_role");
                const _trackerRole = interaction.options.getRole("tracker_role");
                const aboveRole = interaction.options.getRole("ab_course_role");
                const aboveTARole = interaction.options.getRole("ab_ta_role");
                const aboveTrackerRole = interaction.options.getRole("ab_tracker_role");
                const aboveChannel = interaction.options.getChannel("course_channel");
                const courseNumRegex = input.match(/(CS [1-5][0-9]{2})/g);
                if (!courseNumRegex) {
                    interaction.reply(`Invalid course number. \`${input}\` did not match regex: /(CS [1-5][0-9]{2})/g`);
                    return;
                }
                const courseNum = courseNumRegex[0];
                if ((await interaction.guild.channels.fetch()).map(v => v.name).some(v => v === courseNum)) {
                    interaction.reply(`Course ${courseNum} already exists`);
                    return;
                }
                const cancel = i => {
                    acceptButton.button.setDisabled(true);
                    row.update(acceptButton);
                    row.refresh();
                    i.reply(`Cancelled adding course ${courseNum}`);
                };
                const accept = async (i) => {
                    var _a;
                    const reply = await i.deferReply({ fetchReply: true });
                    cancelButton.button.setDisabled(true);
                    row.update(cancelButton);
                    row.refresh();
                    // console.log(_courseRole, taRole, trackerRole, aboveRole, aboveTARole, aboveTrackerRole, aboveChannel)
                    const basicSep = aboveRole !== null && aboveRole !== void 0 ? aboveRole : await interaction.guild.roles.fetch("1032065627818565634");
                    const taSep = aboveTARole !== null && aboveTARole !== void 0 ? aboveTARole : await interaction.guild.roles.fetch("1032072570398331014");
                    const trackerSep = aboveTrackerRole !== null && aboveTrackerRole !== void 0 ? aboveTrackerRole : await interaction.guild.roles.fetch("1032063332489900143");
                    const basicRole = _courseRole !== null && _courseRole !== void 0 ? _courseRole : await interaction.guild.roles.create({
                        name: courseNum,
                        position: basicSep.position
                    });
                    const taRole = _taRole !== null && _taRole !== void 0 ? _taRole : await interaction.guild.roles.create({
                        name: courseNum + " TA",
                        position: taSep.position
                    });
                    const trackerRole = _trackerRole !== null && _trackerRole !== void 0 ? _trackerRole : await interaction.guild.roles.create({
                        name: courseNum + " Tracker",
                        position: trackerSep.position
                    });
                    const basicPerms = ["ViewChannel", "AddReactions", "UseExternalEmojis", "UseExternalStickers", "ReadMessageHistory", "SendMessages", "Connect", "Speak"];
                    const basicPermsSansSending = ["ViewChannel", "AddReactions", "UseExternalEmojis", "UseExternalStickers", "ReadMessageHistory", "Connect", "Speak"];
                    const category = await interaction.guild.channels.create({
                        name: courseNum,
                        type: discord_js_1.ChannelType.GuildCategory,
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
                        position: (_a = aboveChannel.position) !== null && _a !== void 0 ? _a : 0
                    });
                    const announcements = await interaction.guild.channels.create({
                        name: courseNum + " announcements",
                        type: discord_js_1.ChannelType.GuildAnnouncement,
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
                    });
                    const reminders = await interaction.guild.channels.create({
                        name: courseNum + " reminders",
                        type: discord_js_1.ChannelType.GuildText,
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
                    });
                    const general = await interaction.guild.channels.create({
                        name: courseNum + " general",
                        type: discord_js_1.ChannelType.GuildText,
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
                    });
                    const voice = await interaction.guild.channels.create({
                        name: courseNum + " collab VC",
                        type: discord_js_1.ChannelType.GuildVoice,
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
                    });
                    i.editReply(`Added course ${courseNum}`);
                };
                const row = new meta_1.MachiButtonRow(this, uuid, interaction);
                const acceptButton = new meta_1.MachiButton(this, "Add Course", uuid, row, discord_js_1.ButtonStyle.Danger, accept);
                const cancelButton = new meta_1.MachiButton(this, "Cancel", uuid, row, discord_js_1.ButtonStyle.Secondary, cancel);
                row.add(acceptButton, cancelButton);
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
                const courseChannel = interaction.options.getChannel("course_channel");
                interaction.reply(`Removing course ${courseChannel.name}`);
            },
            quarantine: async (interaction) => {
                const courseChannel = interaction.options.getChannel("course_channel");
                interaction.reply(`Quarantining course ${courseChannel.name}`);
            }
        },
        user: {
            view: async (interaction, bot, uuid) => {
                const user = interaction.options.getUser("user");
                const userData = await mongo_1.UserModel.findOne({ id: user.id });
                if (!userData) {
                    interaction.reply({
                        embeds: [{
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL()
                                },
                                title: "User has no data!",
                                description: `Oops, looks like the user isn't present in our database!`,
                                color: util_1.HEX.RED
                            }],
                        ephemeral: true
                    });
                    return;
                }
                const fields = [];
                if (userData.verified != null)
                    fields.push({
                        name: "Verified",
                        value: userData.verified ? "Yes" : "No",
                        inline: true
                    });
                if (userData.netid)
                    fields.push({
                        name: "NetID",
                        value: userData.netid,
                        inline: true
                    });
                if (userData.scheduleData)
                    fields.push(...(0, schedule_1.displayScheduleAsFields)(userData.scheduleData.schedule));
                interaction.reply({
                    embeds: [{
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL()
                            },
                            title: `${user.username}'s data!`,
                            color: interaction.user.accentColor,
                            fields
                        }],
                    ephemeral: true
                });
            }
        }
    },
    upload: 0
};
