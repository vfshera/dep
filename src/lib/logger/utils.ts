import type { ScriptYield, LogOutput } from "~/types";
import { scriptLogger } from ".";
import { type QueryOptions } from "winston";
import { relativeTime } from "~/utils";

export async function getLogs(
  id: string,
  options: QueryOptions = {
    order: "asc",
    fields: ["level", "message", "timestamp"],
    from: new Date(
      new Date().getTime() - 24 * 60 * 60 * 1000 * 30 /** 1 month */,
    ),
  },
): Promise<ReturnType<typeof prettyLogs>> {
  const logger = scriptLogger({
    id: id,
  });

  return new Promise((resolve, reject) => {
    logger.query(options, (err, logs) => {
      if (!logs) {
        return reject(err);
      }

      resolve(prettyLogs(logs.dailyRotateFile));
    });
  });
}

export function logDeploymentInfo(id: string, logs: ScriptYield[]) {
  const logger = scriptLogger({
    id: id,
  });

  logs.forEach((i) => {
    switch (i.type) {
      case "GITINFO":
        logger.log({ level: "gitinfo", message: i.value });
        break;
      case "INFO":
        logger.info(i.value);
        break;
      case "DATA":
        logger.data(i.value);
        break;
      case "ERROR":
        logger.error(i.value);
        break;
      case "SUCCESS":
        logger.log({ level: "success", message: i.value });
        break;
      case "WARN":
        logger.warn(i.value);
        break;
      case "START":
        logger.log({ level: "start", message: i.value });
        break;
      case "END":
        logger.log({ level: "end", message: i.value });
        break;

      default:
        console.log("Unknown log type " + i.type);
    }
  });
}

export function gitInfo(msg: string): ScriptYield {
  return { type: "GITINFO", value: msg };
}

export function info(msg: string): ScriptYield {
  return { type: "INFO", value: msg };
}

export function data(msg: string): ScriptYield {
  return { type: "DATA", value: msg };
}

export function error(msg: string): ScriptYield {
  return { type: "ERROR", value: msg };
}

export function success(msg: string): ScriptYield {
  return { type: "SUCCESS", value: msg };
}

export function warn(msg: string): ScriptYield {
  return { type: "WARN", value: msg };
}

export function end(): ScriptYield {
  return { type: "END", value: "" };
}

export function start(msg: string): ScriptYield {
  return { type: "START", value: msg };
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

export type PrettyLogsOutput = Promise<ReturnType<typeof prettyLogs>>;

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
