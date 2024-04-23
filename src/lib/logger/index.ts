import * as winston from "winston"; 

import DailyRotateFile from "winston-daily-rotate-file";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
};

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json(),
);

export function createWinstonLogger(options: winston.LoggerOptions = {}) {
  return winston.createLogger({
    level: "info",
    levels,
    format,
    transports: [
      createDailyRotateFileTransport(),
      new winston.transports.Console(),
    ],
    exitOnError: false,
    exceptionHandlers: [
      new winston.transports.File({
        filename: "exceptions.log",
        dirname: "logs",
      }),
    ],
    ...options,
  });
}

export function createDailyRotateFileTransport(
  options: DailyRotateFile.DailyRotateFileTransportOptions = {},
) {
  return new DailyRotateFile({
    // @ts-ignore
    filename: "%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "14d",
    dirname: "logs",
    ...options,
  });
}

export function scriptLogger(options: { id: string }) {
  return createWinstonLogger({
    level: "end",
    levels: { ...levels, data: 3, success: 4, start: 5, end: 6 },
    transports: [
      createDailyRotateFileTransport({
        dirname: `logs/${options.id}`,
        json: true,
      }),
    ],
    exceptionHandlers: [
      new winston.transports.File({
        filename: "exceptions.log",
        dirname: `logs/${options.id}`,
      }),
    ],
  });
}


export default createWinstonLogger();
