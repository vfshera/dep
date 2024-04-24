import type { ScriptYield } from "~/types";
import { scriptLogger } from ".";
import { type QueryOptions } from "winston";
import { prettyLogs } from "~/utils";

export async function getLogs(id:string,options:QueryOptions= {
  order: "asc",
  fields: ["level", "message", "timestamp"],
  from: new Date(
    new Date().getTime() - 24 * 60 * 60 * 1000 * 30 /** 1 month */,
  ),
 
}):Promise<ReturnType<typeof prettyLogs>>{
  
  const logger = scriptLogger({
    id: id,
  });

  return new Promise((resolve, reject) => {
    logger.query(
      options
     ,
      (err, logs) => {
        if (!logs) {
          return reject(err);
        }

        resolve(prettyLogs(logs.dailyRotateFile));
      },
    );
  });
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
  