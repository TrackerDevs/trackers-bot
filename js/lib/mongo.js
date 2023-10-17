"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderModel = exports.ReminderSchema = exports.BirthdayModel = exports.BirthdaySchema = exports.UserModel = exports.UserSchema = exports.BaseSchema = void 0;
const mongoose_1 = require("mongoose");
exports.BaseSchema = {
    id: { type: String, required: true }
};
exports.UserSchema = new mongoose_1.Schema(Object.assign(Object.assign({}, exports.BaseSchema), { netid: { type: String, required: false }, verified: { type: Boolean, required: false }, scheduleData: {
        schedule: { type: Array, required: false },
        open: { type: Boolean, required: false }
    } }), {
    timestamps: true
});
exports.UserModel = (0, mongoose_1.model)('User', exports.UserSchema);
exports.BirthdaySchema = new mongoose_1.Schema(Object.assign(Object.assign({}, exports.BaseSchema), { month: String, day: Number, year: {
        type: Number,
        required: false
    } }));
exports.BirthdayModel = (0, mongoose_1.model)('Birthday', exports.BirthdaySchema);
exports.ReminderSchema = new mongoose_1.Schema(Object.assign(Object.assign({}, exports.BaseSchema), { title: String, content: String, channel: String, mentions: [String], dateTime: String, authorID: String }));
exports.ReminderModel = (0, mongoose_1.model)('Reminder', exports.ReminderSchema);
//#endregion
