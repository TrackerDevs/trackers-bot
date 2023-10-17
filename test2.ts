import ical, { VEvent } from "node-ical"
import { DateTime } from "luxon"
import { arrify } from "./lib/util"

const icalURL = "C:/Users/hamza/Downloads/Fall 2023 - Chicago.ics"
const events = ical.sync.parseFile(icalURL)

/*
[x] - Get timing data from the event
[x] - Create slash command 
[x] - Get attachemnt info 
[x] - Parse info 
[] - Send to mongodb 
[] - Update schema 
[] - Utility commands (remove, update, view, see others)
[] - Some sort of viewer using canvas
*/


// TODO - Figure what saturday and sunday are
const dayMapping = {
  "MO": "M",
  "TU": "T",
  "WE": "W",
  "TH": "R",
  "FR": "F",
  "SA": "R",
  "SU": "N"
}

const parseClass = (event: ical.VEvent) => {
  if(!("summary" in event))
    return 

  const summaryPartial = event.summary.slice(0, -2).split(" ")
  const courseName = summaryPartial.slice(0, -2).join(" ")
  const courseID = summaryPartial.slice(-2).join(" ")
  const [crn, creditHours, level, instructor] = event.description.split("\n").map(_ => _.split(": ")[1]?.trim())
  const [startTime, endTime] = [event.start, event.end].map(_ => DateTime.fromJSDate(_ as Date, {zone: "America/Chicago"}).toFormat("hh:mm a"))

  const { dtstart, until, byweekday } = event.rrule.origOptions
  const [startDate, endDate] = [dtstart, until].map(_ => DateTime.fromJSDate(_ as Date, {zone: "America/Chicago"}).toFormat("MM/dd/yyyy"))
  const days = arrify(byweekday).map(_ => dayMapping[_.toString()])

  const res = {
    courseName, courseID, crn, creditHours, level, instructor, startTime, endTime, startDate, endDate, days
  }

  console.log(res)
}

for (const event of Object.values(events)) {
  parseClass(event as VEvent)
};