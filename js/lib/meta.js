"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachiButtonRow = exports.MachiButton = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const machina_1 = require("./machina");
class MachiButton {
    constructor(command, label, uuid, row, style, execute) {
        this.button = new builders_1.ButtonBuilder();
        this.uuid = uuid;
        this.label = label;
        this.style = style;
        this.execute = execute;
        this.customId = machina_1.MachiUtil.customIdMaker(command, this.label, this.uuid);
        this.row = row;
        this.command = machina_1.MachiUtil.getThis(command);
        this.bomb = new machina_1.Bomb(10 * 1000, this.delete.bind(this));
    }
    create() {
        var _a;
        this.button
            .setCustomId(this.customId)
            .setLabel(this.label)
            .setStyle(this.style);
        if (((_a = this.command.button) !== null && _a !== void 0 ? _a : 0) == 0)
            this.command.button = {};
        this.command.button[this.label] = async (interaction, bot, uuid) => {
            await this.delete();
            await this.execute(interaction, bot, uuid);
        };
        return this.button;
    }
    async delete() {
        var _a;
        (_a = this === null || this === void 0 ? void 0 : this.bomb) === null || _a === void 0 ? void 0 : _a.defuse();
        this.button.setDisabled(true);
        this.row.update(this);
        this.row.refresh();
        if (this.command.button[this.label])
            delete this.command.button[this.label];
    }
}
exports.MachiButton = MachiButton;
class MachiButtonRow {
    constructor(command, uuid, interaction) {
        this.row = new discord_js_1.ActionRowBuilder();
        this.components = [];
        this.uuid = uuid;
        this.interaction = interaction;
        this.command = machina_1.MachiUtil.getThis(command);
    }
    add(...components) {
        this.components.push(...components);
    }
    update(...components) {
        let temp = {};
        this.components.forEach(c => temp[c.customId] = c);
        components.forEach(c => temp[c.customId] = c);
        this.components = Object.values(temp);
    }
    async refresh() {
        return this.interaction.editReply({ components: [this.create()] });
    }
    create() {
        return this.row = new discord_js_1.ActionRowBuilder().addComponents(this.components.map(c => c.create()));
    }
}
exports.MachiButtonRow = MachiButtonRow;
