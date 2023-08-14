const { PdfDataParser } = require("pdf-data-parser");
import { DateTime } from "luxon";
import { captialize } from "./util";


const getHeadingIndexes = (rows, search) => {
  let indexes = [],
    i;
  for (i = 0; i < rows.length; i++)
    if (search.every((item) => rows[i].includes(item))) indexes.push(i);
  return indexes;
};

const getIndexes = (rows, search) => {
  let indexes = [],
    i;
  for (i = 0; i < rows.length; i++)
    if (rows[i][0].includes(search)) indexes.push(i);
  return indexes;
};

const trimRows = (rows) => {
  const tableHeading = getHeadingIndexes(rows, ["Title", "Course Details", "Credit Hours", "CRN", "Meeting Times",]);

  const tableFooter = getIndexes(rows, "Total Hours|Registered:")[0];

  if (tableHeading.length === 1) {
    // 1 Page Table
    return rows.slice(tableHeading[0] + 1, tableFooter);
  } else {
    const firstPage = rows.slice(tableHeading[0] + 1, tableHeading[1]);
    const secondPage = rows.slice(tableHeading[1] + 1, tableFooter);

    return firstPage.concat(secondPage);
  }
};

const getClasses = (rows) => {
  const lines = trimRows(rows);
  let classes = [],
    classInfo = [];

  for (const line of lines) {
    const lastWord = line[line.length - 1].slice(-10);
    const datePattern =
      /^(0?[1-9]|1[0-2])\/(0?[1-9]|[1-2][0-9]|3[0-1])\/\d{4}$/;

    if (datePattern.test(lastWord) && classInfo.length > 0) {
      classes.push(classInfo);
      classInfo = [];
    }
    classInfo.push(line);
  }

  return classes;
};

const parseClass = (classRow) => {
  const details = classRow[0];
  const courseName = details[0];
  const courseID = details[1];
  const creditHours = details[2];
  const crn = details[3].slice(0, 5);
  const date = details[3].slice(5).split(" - ");
  const startDate = date[0];
  const endDate = date[1];

  const level = "Undergrad - Chicago";
  const days = classRow[1][0];
  const times = classRow[2][0].split("-");
  const startTime = times[0];
  const endTime = times[1];
  const location = classRow[3][0];

  let instructors = [];
  for (let i = 4; i < classRow.length; i++) {
    if (classRow[i] && classRow[i][0]) {
      instructors.push(classRow[i][0]);
    }
  }
  const instructor = instructors.join(" - ");

  const vagueTime = DateTime.fromJSDate(startDate, { zone: "America/Chicago" });
  const season = vagueTime.month > 5 ? "fall" : "spring";
  const year = startDate.split("/")[2];
  const semester = `${captialize(season)} ${year}`;

  return {
    courseName,
    courseID,
    crn,
    creditHours,
    level,
    instructor,
    startTime,
    endTime,
    startDate,
    endDate,
    days,
    semester,
    season,
    year,
    location,
  };
};

export const parsePDFSchedule = async (pdfURL: string) => {
  try {
    let parser = new PdfDataParser({ url: pdfURL });
    var rows = await parser.parse();

    return Object.values(getClasses(rows))
      .map(parseClass)
      .filter((_) => _);
  } catch (err) {
    console.error("Error reading the file:", err);
  }
};