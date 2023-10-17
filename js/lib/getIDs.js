"use strict";
// THIS IS SUPPOSED TO BE USED LOCALLY, NOT IN PRODUCTION
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const machina_1 = require("./machina");
const ids_json_1 = __importDefault(require("../ids.json"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import { Intents } from "discord.js";
const env = require('dotenv').config({ path: path_1.default.join(__dirname, "../.env") }).parsed;
const bot = new machina_1.Machina(process.env['TOKEN'], process.env['CLIENT_ID'], process.env['GUILD_ID'], process.env['MAIL_USER'], process.env['MAIL_PASS']);
bot.login();
bot.client.on('ready', async (client) => {
    var _a, _b;
    const guild = client.guilds.cache.get(env['GUILD_ID']);
    let roles = await (guild === null || guild === void 0 ? void 0 : guild.roles.fetch());
    let members = await (guild === null || guild === void 0 ? void 0 : guild.members.fetch());
    let temp;
    for (let role of ids_json_1.default.requesting.roles)
        if (((_a = (temp = roles === null || roles === void 0 ? void 0 : roles.toJSON().filter(v => v.name == role))) === null || _a === void 0 ? void 0 : _a.length) == 1)
            ids_json_1.default.recieved.roles[role] = { name: role, id: temp[0].id };
    for (let member of ids_json_1.default.requesting.members)
        if (((_b = (temp = members === null || members === void 0 ? void 0 : members.toJSON().filter(v => v.user.username == member))) === null || _b === void 0 ? void 0 : _b.length) == 1)
            ids_json_1.default.recieved.members[member] = { name: member, id: temp[0].id };
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "../ids.json"), JSON.stringify(ids_json_1.default, null, 2));
});
