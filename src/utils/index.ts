import { twMerge, type ClassNameValue } from "tailwind-merge";
import { type LogOutput } from "~/types";

export function cn(...classes: ClassNameValue[]) {
  return twMerge(classes);
}

/**
 * Convert a date to a relative time string, such as
 * "a minute ago", "in 2 hours", "yesterday", "3 months ago", etc.
 * using Intl.RelativeTimeFormat
 * @see https://www.builder.io/blog/relative-time
 */
export function relativeTime(date: Date | number, from?: Date): string {
  const fromTime = from?.getTime() || Date.now();

  if (from) {
    console.log({ from, date, ft: from.getTime(), fromTime });
  }

  // Allow dates or times to be passed
  const timeMs = typeof date === "number" ? date : date.getTime();

  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.round((timeMs - fromTime) / 1000);

  // Array reprsenting one minute, hour, day, week, month, etc in seconds
  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity,
  ];

  // Array equivalent to the above but in the string representation of the units
  const units: Intl.RelativeTimeFormatUnit[] = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
  ];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds),
  );

  // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
  // is one day in seconds, so we can divide our seconds by this to get the # of days
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Intl.RelativeTimeFormat do its magic
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

/**
 * Splits the log array into segments based on "start" and "end" levels.
 *
 * @param {LogOutput[]} array - the array of LogOutput objects to be split
 * @return {LogOutput[][]} an array of arrays containing segmented LogOutput objects
 */
export function splitLogByLevels(array: LogOutput[]) {
  const segments: LogOutput[][] = [];

  let segment: LogOutput[] = [];

  for (const obj of array) {
    if (obj.level === "start") {
      segment = [obj];
    } else if (obj.level === "end") {
      segment.push(obj);
      segments.push(segment);
      segment = [];
    } else {
      segment.push(obj);
    }
  }

  return segments;
}

/**
 * Generate pretty logs with timestamps and sort them in descending order based on timestamp.
 *
 * @param {LogOutput[]} logs - an array of log outputs
 * @return {object[]} an array of formatted log objects sorted by timestamp in descending order
 */
export function prettyLogs(logs: LogOutput[]) {
  const splitLogs = splitLogByLevels(logs);

  return splitLogs
    .map((log) => {
      const time = log[log.length - 1].timestamp;

      return {
        timestamp: {
          raw: time,
          relative: relativeTime(new Date(time)),
        },
        items: log.map((logItem) => ({
          ...logItem,
          timestamp: {
            raw: logItem.timestamp,
            relative: relativeTime(new Date(logItem.timestamp)),
          },
        })),
      };
    })
    .sort(
      (a, z) =>
        new Date(z.timestamp.raw).getTime() -
        new Date(a.timestamp.raw).getTime(),
    );
}
