"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSchedule = exports.parseClass = exports.dayMapping = void 0;
const node_ical_1 = __importDefault(require("node-ical"));
const luxon_1 = require("luxon");
const util_1 = require("./util");
// TODO - Figure what saturday and sunday are
exports.dayMapping = {
    "MO": "M",
    "TU": "T",
    "WE": "W",
    "TH": "R",
    "FR": "F",
    "SA": "R",
    "SU": "N"
};
// TODO - Make sure that .ICS files are valid before parsing
const parseClass = (event) => {
    if (!("summary" in event))
        return;
    const summaryPartial = event.summary.slice(0, -2).split(" ");
    const courseName = summaryPartial.slice(0, -2).join(" ");
    const courseID = summaryPartial.slice(-2).join(" ");
    const [crn, creditHours, level, instructor] = event.description.split("\n").map(_ => { var _a; return (_a = _.split(": ")[1]) === null || _a === void 0 ? void 0 : _a.trim(); });
    const [startTime, endTime] = [event.start, event.end].map(_ => luxon_1.DateTime.fromJSDate(_, { zone: "America/Chicago" }).toFormat("hh:mm a ZZZZ"));
    const { dtstart, until, byweekday } = event.rrule.origOptions;
    const [startDate, endDate] = [dtstart, until].map(_ => luxon_1.DateTime.fromJSDate(_, { zone: "America/Chicago" }).toFormat("MM/dd/yyyy"));
    const days = (0, util_1.arrify)(byweekday).map(_ => exports.dayMapping[_.toString()]).join(", ");
    const vagueTime = luxon_1.DateTime.fromJSDate(dtstart, { zone: "America/Chicago" });
    const season = vagueTime.month > 5 ? "fall" : "spring";
    const year = vagueTime.year;
    const semester = `${(0, util_1.captialize)(season)} ${year}`;
    const location = event.location;
    return {
        courseName, courseID, crn, creditHours, level, instructor, startTime, endTime, startDate, endDate, days, semester, season, year, location
    };
};
exports.parseClass = parseClass;
const parseSchedule = (schedule) => {
    const events = node_ical_1.default.sync.parseICS(schedule);
    return Object.values(events).map(exports.parseClass).filter(_ => _);
};
exports.parseSchedule = parseSchedule;
