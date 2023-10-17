"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.course = void 0;
const builders_1 = require("@discordjs/builders");
// import courses from "../json/courses.json"
const cs_courses_json_1 = __importDefault(require("../json/cs_courses.json"));
exports.course = {
    data: (new builders_1.SlashCommandBuilder()).setDescription("Get information about UIC courses")
        // .addStringOption(sOp => sOp.setName("category").setDescription("The category that you are interested. Example: ").setRequired(true))
        // .addStringOption(sOp => sOp.setName("course_num").setDescription("The course number of the class you are interested (Optional)").setRequired(false)), 
        .addSubcommandGroup(group => group
        .setName("cs")
        .setDescription("Computer Science Courses")
        .addSubcommand(command => command
        .setName("list")
        .setDescription("List all the courses in the Computer Science department"))
        .addSubcommand(command => command
        .setName("info")
        .setDescription("Get information about a specific course")
        .addNumberOption(nOp => nOp.setName("course_num").setDescription("The course number of the class you are interested in. E.g. \`401\` for CS 401").setRequired(true)))),
    execute: async (interaction) => {
        interaction.reply("this is a fallback, and should theoretically never rrrrrun");
    },
    subCommandGroups: {
        cs: {
            list: async (interaction) => {
                const user = await interaction.user.fetch(true);
                interaction.reply({ content: "Here are all the courses in the Computer Science department", embeds: [{
                            title: "Computer Science Courses",
                            description: Object.values(cs_courses_json_1.default).map(field => `\`${field.number}\` — ${field.title}`).join("\n"),
                            author: {
                                name: user.username,
                                icon_url: user.avatarURL()
                            },
                            color: user.accentColor
                        }] });
            },
            info: async (interaction) => {
                const user = await interaction.user.fetch(true);
                const courseNum = interaction.options.getNumber("course_num");
                const course = cs_courses_json_1.default['CS ' + courseNum];
                if (course) {
                    interaction.reply({ embeds: [{
                                title: course.number + " — " + course.title,
                                description: course.desc,
                                author: {
                                    name: user.username,
                                    icon_url: user.avatarURL()
                                },
                                color: user.accentColor
                            }] });
                }
                else {
                    interaction.reply({ content: "I couldn't find that course, sorry!" });
                }
            }
        }
    },
    upload: 0
};
