import ical, { VEvent } from "node-ical"
import { DateTime } from "luxon"
import { arrify, captialize } from "./util"

// TODO - Figure what saturday and sunday are
export const dayMapping = {
  "MO": "M",
  "TU": "T",
  "WE": "W",
  "TH": "R",
  "FR": "F",
  "SA": "R",
  "SU": "N"
}

// TODO - Make sure that .ICS files are valid before parsing
export const parseClass = (event: ical.VEvent) => {
  if(!("summary" in event))
    return 

  const summaryPartial = event.summary.slice(0, -2).split(" ")
  const courseName = summaryPartial.slice(0, -2).join(" ")
  const courseID = summaryPartial.slice(-2).join(" ")
  const [crn, creditHours, level, instructor] = event.description.split("\n").map(_ => _.split(": ")[1]?.trim())
  const [startTime, endTime] = [event.start, event.end].map(_ => DateTime.fromJSDate(_ as Date, {zone: "America/Chicago"}).toFormat("hh:mm a ZZZZ"))

  const { dtstart, until, byweekday } = event.rrule.origOptions
  const [startDate, endDate] = [dtstart, until].map(_ => DateTime.fromJSDate(_, {zone: "America/Chicago"}).toFormat("MM/dd/yyyy"))
  const days = arrify(byweekday).map(_ => dayMapping[_.toString()]).join(", ")

  const vagueTime = DateTime.fromJSDate(dtstart, {zone: "America/Chicago"})
  const season = vagueTime.month > 5 ? "fall" : "spring"
  const year = vagueTime.year
  const semester = `${captialize(season)} ${year}`

  const location = event.location

  return {
    courseName, courseID, crn, creditHours, level, instructor, startTime, endTime, startDate, endDate, days, semester, season, year, location
  }
}

export const parseSchedule = (schedule: string) => {
  const events = ical.sync.parseICS(schedule)
  return Object.values(events).map(parseClass).filter(_ => _)
}