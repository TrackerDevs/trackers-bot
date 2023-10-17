"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.displayScheduleAsFields = void 0;
const builders_1 = require("@discordjs/builders");
const util_1 = require("../lib/util");
const axios_1 = __importDefault(require("axios"));
const icsParser_1 = require("../lib/icsParser");
const pdfParser_1 = require("../lib/pdfParser");
const mongo_1 = require("../lib/mongo");
// This forces the ephemeral option, for testing only
const forcedVisible = false;
const displayScheduleAsFields = (schedule) => schedule.map(_ => ({
    name: _.courseName,
    value: `Course ID: \`${_.courseID}\`\nTime: \`${_.startTime}\` - \`${_.endTime}\`\nLocation: \`${_.location}\`\nInstructor: \`${_.instructor ? _.instructor : "Not yet assigned"}\`\n`,
    inline: false
}));
exports.displayScheduleAsFields = displayScheduleAsFields;
exports.schedule = {
    data: (new builders_1.SlashCommandBuilder()).setDescription("Schedule related commands")
        .addSubcommand(command => command
        .setName("add")
        .setDescription("Add your schedule!")
        .addAttachmentOption(option => option.setName("schedule").setDescription("Your schedule .ICS file!").setRequired(true))
        .addBooleanOption(option => option.setName("open").setDescription("Should your schedule be open to view by other students?").setRequired(false))).addSubcommand(command => command
        .setName("help")
        .setDescription("Get help with the schedule command")).addSubcommand(command => command
        .setName("get")
        .setDescription("Get yours or someones schedule (if they allow it)!")
        .addUserOption(option => option.setName("user").setDescription("The user you want to get the schedule of!").setRequired(true))),
    execute: async (interaction) => {
        interaction.reply("this is a fallback, and should theoretically never run");
    },
    subCommands: {
        help: async (interaction) => {
            interaction.reply("Schedule Help command is under construction!🚧👷‍♀️👷‍♂️");
        },
        add: async (interaction) => {
            var _a;
            const attachemnt = interaction.options.getAttachment("schedule");
            let open = (_a = interaction.options.getBoolean("open")) !== null && _a !== void 0 ? _a : true;
            let parsedSchedules = null;
            if (attachemnt === null || attachemnt === void 0 ? void 0 : attachemnt.name.endsWith(".ics")) {
                const schedule = (await axios_1.default.get(attachemnt.url)).data;
                parsedSchedules = (0, icsParser_1.parseSchedule)(schedule);
            }
            else if (attachemnt === null || attachemnt === void 0 ? void 0 : attachemnt.name.endsWith(".pdf")) {
                const schedulePDFLink = (await axios_1.default.get(attachemnt.url)).config.url;
                parsedSchedules = await (0, pdfParser_1.parsePDFSchedule)(schedulePDFLink);
                if (!parsedSchedules) {
                    interaction.reply({
                        embeds: [{
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL()
                                },
                                title: "Invalid PDF!",
                                description: `Attachment [${attachemnt === null || attachemnt === void 0 ? void 0 : attachemnt.name}] is invalid. Please try with a different schedule, or use a manual reactions roles!`,
                                color: util_1.HEX.RED
                            }],
                        ephemeral: !forcedVisible
                    });
                    return;
                }
            }
            else {
                interaction.reply({
                    embeds: [{
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL()
                            },
                            title: "Attachement Invalid!",
                            description: `You uploaded [${attachemnt === null || attachemnt === void 0 ? void 0 : attachemnt.name}]. This is not a proper .pdf or .ics file! Please try again!`,
                            color: util_1.HEX.RED
                        }],
                    ephemeral: !forcedVisible
                });
                return;
            }
            if (!parsedSchedules)
                return;
            if (parsedSchedules.length === 0) {
                interaction.reply({
                    embeds: [{
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL()
                            },
                            title: "Empty Schedule!",
                            description: `Looks like there are no valid classes! Make sure you uploaded the correct .pdf or .ics file!`,
                            color: util_1.HEX.RED
                        }],
                    ephemeral: !forcedVisible
                });
                return;
            }
            let rolesAdded = [];
            const member = await interaction.guild.members.fetch(interaction.user.id);
            parsedSchedules.forEach((classRow) => {
                const temp = classRow.courseID.split(' ');
                const courseId = temp.slice(0, 2).join(' ');
                const role = interaction.guild.roles.cache.find(role => role.name === courseId);
                if (role) {
                    member.roles.add(role);
                    if (!rolesAdded.includes(courseId)) {
                        rolesAdded.push(role.id);
                    }
                }
            });
            const replyFields = (0, exports.displayScheduleAsFields)(parsedSchedules);
            replyFields.push({ name: "Added The Following Roles: ", value: rolesAdded.map(roleId => `<@&${roleId}>`).join(", "), inline: false });
            interaction.reply({
                embeds: [{
                        author: {
                            name: interaction.user.username,
                            icon_url: interaction.user.avatarURL()
                        },
                        title: "Schedule Added!",
                        description: `You have successfully added your schedule! Below is your schedule!`,
                        color: util_1.HEX.GREEN,
                        fields: replyFields,
                    }],
                ephemeral: !forcedVisible
            });
            await mongo_1.UserModel.updateOne({ id: interaction.user.id }, {
                $set: {
                    scheduleData: {
                        schedule: parsedSchedules,
                        open
                    }
                }
            }, { upsert: true })
                .catch(r => console.error("Error adding schedule! " + r));
        },
        get: async (interaction) => {
            const user = interaction.options.getUser("user");
            const userData = await mongo_1.UserModel.findOne({ id: user.id });
            const isSelf = user.id === interaction.user.id;
            const avaialable = !!userData && "scheduleData" in userData;
            if (!isSelf && (!avaialable || !userData.scheduleData.open)) {
                interaction.reply({
                    embeds: [{
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL()
                            },
                            title: "Schedule Not Available!",
                            description: `Looks like ${user.username} either hasn't added their schedule or made it visable yet! Perhaps you should ask them to add it? 👀`,
                            color: util_1.HEX.RED
                        }],
                });
                return;
            }
            if (!userData) {
                interaction.reply({
                    embeds: [{
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL()
                            },
                            title: "You aren't verified!",
                            description: `C'mon! You aren't verified as a UIC student first. Verify yourself with \`/verify\`!`,
                            color: util_1.HEX.RED
                        }],
                });
                return;
            }
            if (!avaialable) {
                interaction.reply({
                    embeds: [{
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL()
                            },
                            title: "You dont have a schedule!",
                            description: `C'mon! You can't look at your own schedule if you don't have one! Add one with \`/schedule add\`!`,
                            color: util_1.HEX.RED
                        }],
                });
                return;
            }
            // TODO - make this an actual type
            const userSchedule = userData.scheduleData.schedule;
            interaction.reply({
                embeds: [{
                        author: {
                            name: interaction.user.username,
                            icon_url: interaction.user.avatarURL()
                        },
                        title: `Schedule Details of ${user.username}!`,
                        // description: `User schedule for ${userSchedule}`,
                        fields: (0, exports.displayScheduleAsFields)(userSchedule),
                        color: util_1.HEX.GREEN
                    }],
            });
        }
    },
    upload: 0
};
